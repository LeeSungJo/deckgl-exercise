import React, { useState, useMemo } from "react";
// import { createRoot } from "react-dom/client";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer, ArcLayer } from "@deck.gl/layers";
import maplibregl from "maplibre-gl";
import { Map } from "react-map-gl";
import { scaleQuantile } from "d3-scale";

// import testMap from "./test.geojson";
import KOREA_WSG84 from "./korea_wsg84.geojson";
import ARCDATA from "./ArcData.json";

// Source data GeoJSON
// const DATA_URL =
//   "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/arc/counties.json"; // eslint-disable-line

// const DATA = [
//   {
//     properties: {
//       name: "포항",
//       centroid: [129.269029, 36.80787],
//     },
//   },
// ];

// const DATA = [
//   {
//     inbound: 72633,
//     outbound: 74735,
//     from: {
//       name: "19th St. Oakland (19TH)",
//       coordinates: [129.269029, 36.80787],
//     },
//     to: {
//       name: "12th St. Oakland City Center (12TH)",
//       coordinates: [127.271604, 37.803664],
//     },
//   },
// ];

const inFlowColors = [
  [255, 255, 204],
  [199, 233, 180],
  [127, 205, 187],
  [65, 182, 196],
  [29, 145, 192],
  [34, 94, 168],
  [12, 44, 132],
];

const outFlowColors = [
  [255, 255, 178],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [252, 78, 42],
  [227, 26, 28],
  [177, 0, 38],
];

// Viewport settings, 서울시청으로 세팅
const INITIAL_VIEW_STATE = {
  longitude: 126.9779451,
  latitude: 37.5662952,
  zoom: 6,
  pitch: 0, // 상하로 기울어진 각도, 높을수록 기울어진 상태에서 start
  bearing: 0, // 좌우로 꺾이는 각도, 90이면 90도 꺾임
};

// hover시 이름 표시됨
function getTooltip({ object }) {
  // console.log(object);
  return object && object.properties.CTP_KOR_NM;
}

export default function KoreaMap() {
  // let data = fetch(DATA_URL).then((response) => response.json());

  const [selectedCounty, selectCounty] = useState(null);

  function calculateArcs(data, selectedCounty) {
    if (!data || !data.length) {
      return null;
    }
    if (!selectedCounty) {
      console.log(data);
      selectedCounty = data.find(
        (f) => f.properties.name === "Los Angeles, CA"
      );
    }

    const { flows, centroid } = selectedCounty.properties;

    const arcs = Object.keys(flows).map((toId) => {
      const f = data[toId];
      return {
        source: centroid,
        target: f.properties.centroid,
        value: flows[toId],
      };
    });

    const scale = scaleQuantile()
      .domain(arcs.map((a) => Math.abs(a.value)))
      .range(inFlowColors.map((c, i) => i));

    arcs.forEach((a) => {
      a.gain = Math.sign(a.value);
      a.quantile = scale(Math.abs(a.value));
    });

    return arcs;
  }
  // function calculateArcs(data, selectedCounty) {
  //   if (!data || !data.length) {
  //     return null;
  //   }
  //   if (!selectedCounty) {
  //     console.log(data);
  //     selectedCounty = data.find(
  //       (f) => f.properties.name === "Los Angeles, CA"
  //     );
  //   }

  //   const { flows, centroid } = selectedCounty.properties;

  //   const arcs = Object.keys(flows).map((toId) => {
  //     const f = data[toId];
  //     return {
  //       source: centroid,
  //       target: f.properties.centroid,
  //       value: flows[toId],
  //     };
  //   });

  //   const scale = scaleQuantile()
  //     .domain(arcs.map((a) => Math.abs(a.value)))
  //     .range(inFlowColors.map((c, i) => i));

  //   arcs.forEach((a) => {
  //     a.gain = Math.sign(a.value);
  //     a.quantile = scale(Math.abs(a.value));
  //   });

  //   return arcs;
  // }

  const arcs = useMemo(
    () => calculateArcs(ARCDATA, selectedCounty),
    [selectedCounty]
  );

  // const onClick = (info) => {
  //   if (info.object) {
  //     // eslint-disable-next-line
  //     alert(
  //       `${info.object.properties.name} (${info.object.properties.abbrev})`
  //     );
  //   }
  // };

  // 세계지도 Base Map
  const MAP_STYLE =
    "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json";

  // 한국 지도 Layer
  const koreaWsg84 = new GeoJsonLayer({
    id: "airports",
    data: KOREA_WSG84,
    // Styles
    filled: true,
    pointRadiusMinPixels: 2,
    pointRadiusScale: 2000,
    getPointRadius: (f) => 11 - f.properties.scalerank,
    getFillColor: [191, 172, 226, 180], // [r, g, b, 투명도(0~255)]
    getLineWidth: 600,
    getLineColor: [50, 0, 50, 80],
    // Interactive props
    pickable: true,
    autoHighlight: true,
    onClick: ({ object }) => selectCounty(object),
    // onClick,
  });

  const arcsLayer = new ArcLayer({
    id: "arc",
    data: arcs,
    getSourcePosition: (d) => d.source,
    getTargetPosition: (d) => d.target,
    getSourceColor: (d) =>
      (d.gain > 0 ? inFlowColors : outFlowColors)[d.quantile],
    getTargetColor: (d) =>
      (d.gain > 0 ? outFlowColors : inFlowColors)[d.quantile],
    getWidth: 1,
  });

  const layers = [koreaWsg84, arcsLayer];

  // let data = null
  // useEffect(() => {
  //   data = fetch(DATA_URL).then((response) => response.json());
  // }, [data]);

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
      getTooltip={getTooltip}
    >
      <Map
        reuseMaps
        mapLib={maplibregl}
        mapStyle={MAP_STYLE}
        preventStyleDiffing={true}
      />
    </DeckGL>
  );
}

// export function renderToDOM(container) {
//   const root = createRoot(container);
//   root.render(<KoreaMap />);

//   fetch(DATA_URL)
//     .then((response) => response.json())
//     .then(({ features }) => {
//       root.render(<KoreaMap data={features} />);
//     });
// }
