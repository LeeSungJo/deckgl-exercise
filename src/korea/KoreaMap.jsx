import React, { useState, useMemo } from "react";
// import { createRoot } from "react-dom/client";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer, ArcLayer, IconLayer } from "@deck.gl/layers";
import maplibregl from "maplibre-gl";
import { Map } from "react-map-gl";
import { scaleQuantile } from "d3-scale";

// import KOREA_WSG84 from "./maps/korea_wsg84.geojson";
import KOREA_WSG84 from "./maps/korea_wsg84_low.json";
// import ArcData from "./maps/ArcData.json";
import CENTROID_GEO from "./maps/centroid_geo.json";
import arrowIcon from "./assets/arrow.svg";
// import circleIcon from "./assets/circle_15.svg";

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
  zoom: 6, // 숫자가 높을수록 확대됨
  pitch: 30, // 상하로 기울어진 각도, 높을수록 기울어진 상태에서 start
  bearing: 0, // 좌우로 꺾이는 각도, 90이면 90도 꺾임
};

function calculateArcs(data, selectedCounty) {
  // console.log(selectedCounty);
  if (!data || !data.length) {
    return null;
  }
  if (!selectedCounty) {
    selectedCounty = data.find((f) => f.properties.CTP_KOR_NM === "서울특별시");
  }

  const centroidData = CENTROID_GEO.features.find(
    (f) => f.properties.CTP_KOR_NM === selectedCounty.properties.CTP_KOR_NM
  );
  const { flows, centroid } = centroidData.properties;

  const arcs = Object.keys(flows).map((toId) => {
    // !원본!
    // const f = data[toId];
    const f = data.find(
      (obj) => parseInt(obj.properties.CTPRVN_CD) === flows[toId]
    );

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
    console.log(a);
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
//     selectedCounty = data.find((f) => f.properties.name === "Los Angeles, CA");
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

// hover시 이름 표시됨
function getTooltip({ object }) {
  try {
    return object && object.properties.CTP_KOR_NM;
  } catch (err) {
    if (err === TypeError) {
      console.log(err);
    }
  }
  // return object && object.properties.CTP_KOR_NM;
}

export default function KoreaMap() {
  const data = CENTROID_GEO.features;

  const [selectedCounty, selectCounty] = useState(null);

  const arcs = useMemo(
    () => calculateArcs(data, selectedCounty),
    [data, selectedCounty]
    // console.log(data)
  );

  // 세계지도 Base Map
  // 이 사이트에서 Base Map 선택 가능 : https://deck.gl/docs/api-reference/carto/basemap
  const MAP_STYLE =
    "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

  // 한국 지도 Layer
  const koreaWsg84 = new GeoJsonLayer({
    id: "korea-map",
    data: KOREA_WSG84,
    // Styles
    filled: true,
    pointRadiusMinPixels: 2,
    pointRadiusScale: 2000,
    getPointRadius: (f) => 11 - f.properties.scalerank,
    getFillColor: [246, 241, 241, 180], // [r, g, b, 투명도(0~255)]
    getLineWidth: 600,
    getLineColor: [25, 108, 148, 80],
    // Interactive props
    pickable: true,
    autoHighlight: true,
    onClick: ({ object }) => {
      selectCounty(object);
    },
  });

  // console.log(arcs);
  const arcsLayer = new ArcLayer({
    id: "arc",
    data: arcs,
    getSourcePosition: (d) => d.source,
    getTargetPosition: (d) => d.target,
    // 후보1
    // getSourceColor: [50, 89, 217],
    // getTargetColor: [194, 52, 155],

    // 후보2
    // getSourceColor: [107, 182, 255],
    // getTargetColor: [1, 75, 179],

    // 후보3
    getSourceColor: [47, 229, 158],
    getTargetColor: [77, 75, 201],

    // getSourceColor: (d) =>
    //   (d.gain > 0 ? inFlowColors : outFlowColors)[d.quantile],
    // getTargetColor: (d) =>
    //   (d.gain > 0 ? outFlowColors : inFlowColors)[d.quantile],
    getWidth: 5, // 화살표 두께
    greatCircle: true,
    onIconError: true,
  });

  // const ICON_MAPPING = {
  //   marker: { x: 0, y: 0, width: 70, height: 70, mask: true },
  // };

  // const iconLayer = new IconLayer({
  //   id: "icon-layer",
  //   data: arcs,
  //   pickable: true,
  //   iconAtlas: "arrowIcon",
  //   getIcon: (d) => "marker",
  //   iconMapping: ICON_MAPPING,
  //   sizeScale: 15,
  //   getPosition: (d) => d.coordinates,
  //   getSize: (d) => 5,
  //   getColor: (d) => [Math.sqrt(d.exits), 140, 0],
  // });

  const ICON_MAPPING = {
    marker: { x: 0, y: 5, width: 70, height: 100, mask: true },
    // marker: { x: 0, y: 0, width: 15, height: 25, mask: true },
  };

  const iconLayer = new IconLayer({
    id: "icon-layer",
    data: arcs,
    pickable: true,
    // iconAtlas and iconMapping are required
    // getIcon: return a string
    // iconAtlas: "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
    iconAtlas: arrowIcon,
    iconMapping: ICON_MAPPING,
    getIcon: (d) => "marker",

    sizeScale: 10,
    // getPosition: (d) => d.properties.centroid,
    getPosition: (d) => d.target,
    getSize: (d) => 3,
    // getColor: (d) => [Math.sqrt(d.exits), 140, 0],
    getColor: (d) => [77, 75, 201],
  });

  // 레이어 추가
  const layers = [koreaWsg84, arcsLayer, iconLayer];

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
      getTooltip={getTooltip}
      // zoomOffset={5}
      // extent={[150, 150, 30, 30]}
      // minZoom={4}
      // maxZoom={10}
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
