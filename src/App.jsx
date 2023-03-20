import React, { useState, useEffect } from "react";
// import KoreaMap from "./korea/KoreaMap";
import DeckTest from "./korea/DeckTest";

export default function App() {
  // return <KoreaMap />;
  // const useFetch = (url) => {
  //   const [data, setData] = useState(null);

  //   useEffect(() => {
  //     fetch(url)
  //       .then((res) => res.json())
  //       .then((data) => setData(data));
  //   }, [url]);

  //   return data;
  // };

  // const sources = useFetch(
  //   "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/arc/counties.json"
  // );
  // useEffect(() => {
  //   fetch(
  //     "https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/arc/counties.json"
  //   )
  //     .then(console.log())
  //     .then((response) => response.json())
  //     .then(({ features }) => {
  //       return <DeckTest data={features} />;
  //     });
  // }, []);

  return <DeckTest />;
}
