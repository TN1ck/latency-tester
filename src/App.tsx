import React from "react";
// import { AsyncTypeahead } from "react-bootstrap-typeahead";
import { Typeahead } from "react-bootstrap-typeahead";
import withAsync from "./async";
import "./App.css";
import "react-bootstrap-typeahead/css/Typeahead.css";

const AsyncTypeahead = withAsync(Typeahead) as any;

function App() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [useCache, setUseCache] = React.useState(false);
  const [latency, setLatency] = React.useState(50);
  const [deviation, setLatencyDeviation] = React.useState(0.2);
  const [throttle, setThrottle] = React.useState(20);
  const [options, setOptions] = React.useState<string[]>([]);

  const handleSearch = React.useMemo(() => {
    return (query: string) => {
      setIsLoading(true);
      const randomness = (Math.random() - 0.5) * latency * 0.2;
      const requestLatency = latency + randomness;
      console.log(`Query start: ${requestLatency}ms`);
      setTimeout(() => {
        const options = new Array(5).fill(0).map((_, i) => {
          return `${query}-option-${i}`;
        });
        setOptions(options);
        setIsLoading(false);
        console.log("Query end");
      }, requestLatency);
    };
  }, [latency]);

  const handleSliderUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLatency(Number(e.target.value));
  };

  const filterBy = () => true;

  return (
    <div className="App">
      <header className="App-header">
        <h2>
          Typeahead latency tester <small>By Tom Nick</small>
        </h2>
        <div className="form-group">
          <label className="form-label" htmlFor="latency">
            Latency: {latency}ms
          </label>
          <input
            className="form-control-range"
            onChange={handleSliderUpdate}
            value={latency}
            id="latency"
            type="range"
            step={10}
            min={0}
            max={2000}
          />
          <label className="form-label" htmlFor="deviation">
            Random latency deviation: {deviation * 100}%
          </label>
          <input
            className="form-control-range"
            onChange={(e) => setLatencyDeviation(Number(e.target.value) / 100)}
            value={deviation * 100}
            id="devation"
            type="range"
            step={5}
            min={0}
            max={100}
          />
          <label className="form-label" htmlFor="throttle">
            Throttle (Minimum time between requests): {throttle}ms
          </label>
          <input
            className="form-control-range"
            onChange={(e) => setThrottle(Number(e.target.value))}
            value={throttle}
            id="throttle"
            type="range"
            step={10}
            min={0}
            max={1000}
          />
          <div className="form-group form-check">
            <input
              onChange={() => setUseCache(!useCache)}
              type="checkbox"
              checked={useCache}
              className="form-check-input"
              id="cache"
            />
            <label className="form-check-label" htmlFor="cache">
              Use Cache
            </label>
          </div>
        </div>
        <AsyncTypeahead
          throttleTime={throttle}
          filterBy={filterBy}
          delay={0}
          id="async-typeahead"
          isLoading={isLoading}
          useCache={useCache}
          minLength={1}
          onSearch={handleSearch}
          options={options}
          placeholder={"Loading..."}
        />
      </header>
    </div>
  );
}

export default App;
