import "./App.css";
import "semantic-ui-css/semantic.min.css";

import React, {useEffect, useRef, useReducer, useCallback} from "react";
import {Search, Grid} from "semantic-ui-react";

const initialState = {
  loading: false,
  results: [],
  value: "",
  valueSelection: null,
};

function exampleReducer(state, action) {
  switch (action.type) {
    case "CLEAN_QUERY":
      return initialState;
    case "START_SEARCH":
      return {...state, loading: true, value: action.query};
    case "FINISH_SEARCH":
      return {...state, loading: false, results: action.results};
    case "UPDATE_SELECTION":
      return {...state, value: action.selection, valueSelection: action.selection};

    default:
      throw new Error();
  }
}

function SearchExampleStandard() {
  const [state, dispatch] = useReducer(exampleReducer, initialState);
  const {loading, results, value, valueSelection} = state;

  const timeoutRef = useRef();
  const handleSearchChange = useCallback((e, data) => {
    clearTimeout(timeoutRef.current);
    dispatch({type: "START_SEARCH", query: data.value});

    timeoutRef.current = setTimeout(() => {
      if (data.value.length === 0) {
        dispatch({type: "CLEAN_QUERY"});
        return;
      }

      const citySearch = data.value;
      // get the latest ten measurements
      const searchResults = fetch(
        `https://u50g7n0cbj.execute-api.us-east-1.amazonaws.com/v2/measurements?date_from=2000-01-01T00%3A00%3A00%2B00%3A00&date_to=2021-05-25T19%3A40%3A00%2B00%3A00&limit=10&page=1&offset=0&sort=desc&unit=ppm&radius=1000&city=${citySearch}&order_by=datetime&isAnalysis=true`
      )
        .then((response) => response.json())
        .then((data) =>
          dispatch({
            type: "FINISH_SEARCH",
            results: data.results.map((item) => {
              return {
                title: item.city,
                description: `${item.value} ${item.unit}`,
              };
            }),
          })
        )
        .catch((err) => {
          console.log("ERR IN TYPE AHEAD SEARCH: ", err);
        });
    }, 300);
  }, []);
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div>
      {/* <pre style={{overflowX: "auto"}}>{JSON.stringify({loading, results, value}, null, 2)}</pre> */}
      <Search
        loading={loading}
        onResultSelect={(e, data) =>
          dispatch({type: "UPDATE_SELECTION", selection: data.result.title})
        }
        onSearchChange={handleSearchChange}
        results={results}
        value={value}
      />
      {valueSelection && results?.length > 0 && (
        <span>
          Air Quality for {valueSelection}: {results[0].description}{" "}
        </span>
      )}
    </div>
  );
}

function App() {
  return (
    <Grid columns={2} className={"search-row"}>
      <span> Compare Air Quality in Two Cities in the USA (case sensitive)</span>
      <Grid.Row>
        <Grid.Column>
          <SearchExampleStandard key={1}></SearchExampleStandard>
        </Grid.Column>
        <Grid.Column>
          <SearchExampleStandard key={2}></SearchExampleStandard>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}

export default App;
