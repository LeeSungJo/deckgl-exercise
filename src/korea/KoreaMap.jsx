import React from "react";
import DeckGL from "@deck.gl/react";
import { LineLayer, GeoJsonLayer } from "@deck.gl/layers";
import maplibregl from "maplibre-gl";
import { Map } from "react-map-gl";

import testMap from "./test.geojson";
import korea_wsg84 from "./korea_wsg84.geojson";

// Viewport settings, 서울시청으로 세팅
const INITIAL_VIEW_STATE = {
  longitude: 126.9779451,
  latitude: 37.5662952,
  zoom: 13,
  pitch: 0, // 상하로 기울어진 각도, 높을수록 기울어진 상태에서 start
  bearing: 0, // 좌우로 꺾이는 각도, 90이면 90도 꺾임
};

// Data to be used by the LineLayer
// const data = [
//   {
//     sourcePosition: [-122.41669, 37.7853],
//     targetPosition: [-122.41669, 37.781],
//   },
// ];

export default function KoreaMap({ viewState }) {
  const onClick = (info) => {
    if (info.object) {
      // eslint-disable-next-line
      alert(
        `${info.object.properties.name} (${info.object.properties.abbrev})`
      );
    }
  };

  const MAP_STYLE =
    "https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json";
  const layers = [
    new GeoJsonLayer({
      id: "airports",
      data: korea_wsg84,
      // Styles
      filled: true,
      pointRadiusMinPixels: 2,
      pointRadiusScale: 2000,
      getPointRadius: (f) => 11 - f.properties.scalerank,
      getFillColor: [200, 0, 0, 180],
      // Interactive props
      pickable: true,
      autoHighlight: true,
      onClick,
    }),
  ];

  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={layers}
    >
      <Map
        reuseMaps
        mapLib={maplibregl}
        mapStyle={MAP_STYLE}
        preventStyleDiffing={true}
      />
      {/* <LineLayer id="line-layer" data={testMap} /> */}
    </DeckGL>
  );
}
