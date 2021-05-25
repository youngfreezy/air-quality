import "./App.css";
import "semantic-ui-css/semantic.min.css";

import _ from "lodash";

import React, {useEffect, useRef, useReducer, useCallback} from "react";
import {Search, Grid} from "semantic-ui-react";

const initialState = {
  loading: false,
  results: [],
  value: "",
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
      return {...state, value: action.selection};

    default:
      throw new Error();
  }
}

function SearchExampleStandard() {
  const [state, dispatch] = useReducer(exampleReducer, initialState);
  const {loading, results, value} = state;

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
      const searchResults = fetch(
        `https://docs.openaq.org/v2/cities?limit=100&page=1&offset=0&sort=asc&city=${citySearch}&order_by=city`
      )
        .then((response) => response.json())
        .then((data) => console.log(data))
        .catch((err) => {
          console.log("ERR IN TYPE AHEAD SEARCH: ", err);
        });

      dispatch({
        type: "FINISH_SEARCH",
        results: [],
      });
    }, 300);
  }, []);
  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <Search
      loading={loading}
      onResultSelect={(e, data) =>
        dispatch({type: "UPDATE_SELECTION", selection: data.result.title})
      }
      onSearchChange={handleSearchChange}
      results={results}
      value={value}
    />
  );
}

function App() {
  return (
    <Grid columns={2} className={"search-row"}>
      <span> Compare Air Quality in Two Cities in the USA</span>
      <Grid.Row>
        <Grid.Column>
          <SearchExampleStandard></SearchExampleStandard>
        </Grid.Column>
        <Grid.Column>
          <SearchExampleStandard></SearchExampleStandard>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}

export default App;
