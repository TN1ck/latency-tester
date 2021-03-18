import { debounce, throttle } from "lodash";
import { forwardRef, useCallback, useEffect, useRef } from "react";
import useForceUpdate from "@restart/hooks/useForceUpdate";
import usePrevious from "@restart/hooks/usePrevious";

import type { ComponentType } from "react";

import type { Option } from "react-bootstrap-typeahead";

const defaultProps = {
  delay: 200,
  minLength: 2,
  options: [],
  promptText: "Type to search...",
  searchText: "Searching...",
  useCache: true,
};

type Props = {
  allowNew: any;
  minLength: number;
  onInputChange: any;
  options: any;
  delay: number;
  emptyLabel: string;
  isLoading: boolean;
  onSearch: (str: string) => void;
  promptText: any;
  searchText: any;
  useCache: boolean;
  throttleTime: number;
};

type Cache = {
  [key: string]: Option[];
};

type DebouncedFunction = Function & {
  cancel: () => void;
};

/**
 * Logic that encapsulates common behavior and functionality around
 * asynchronous searches, including:
 *
 *  - Debouncing user input
 *  - Optional query caching
 *  - Search prompt and empty results behaviors
 */
export function useAsync(props: Props) {
  const {
    allowNew,
    delay,
    emptyLabel,
    isLoading,
    minLength,
    throttleTime,
    onInputChange,
    onSearch,
    options,
    promptText,
    searchText,
    useCache,
    ...otherProps
  } = props;

  const cacheRef: { current: Cache } = useRef({});
  const handleSearchDebouncedRef = useRef();
  const queryRef: { current: string } = useRef("");

  const forceUpdate = useForceUpdate();
  const prevProps = usePrevious(props);

  const handleSearch = useCallback(
    (query: string) => {
      queryRef.current = query;

      if (!query || (minLength && query.length < minLength)) {
        return;
      }

      // Use cached results, if applicable.
      if (useCache && cacheRef.current[query]) {
        // Re-render the component with the cached results.
        forceUpdate();
        return;
      }
      // Perform the search.
      onSearch(query);
    },
    [forceUpdate, minLength, onSearch, useCache]
  );

  // Set the debounced search function.
  useEffect(() => {
    console.log(throttleTime, delay);
    (handleSearchDebouncedRef as any).current = throttle(
      debounce(handleSearch, 0),
      throttleTime
    );
    return () => {
      handleSearchDebouncedRef.current &&
        (handleSearchDebouncedRef as any).current.cancel();
    };
  }, [delay, throttleTime, handleSearch]);

  useEffect(() => {
    // Ensure that we've gone from a loading to a completed state. Otherwise
    // an empty response could get cached if the component updates during the
    // request (eg: if the parent re-renders for some reason).
    if (!isLoading && prevProps && prevProps.isLoading && useCache) {
      cacheRef.current[queryRef.current] = options;
    }
  });

  const getEmptyLabel = () => {
    if (!queryRef.current.length) {
      return promptText;
    }

    if (isLoading) {
      return searchText;
    }

    return emptyLabel;
  };

  const handleInputChange = useCallback(
    (query: string, e: any) => {
      onInputChange && onInputChange(query, e);

      handleSearchDebouncedRef.current &&
        (handleSearchDebouncedRef as any).current(query);
    },
    [onInputChange]
  );

  const cachedQuery = cacheRef.current[queryRef.current];

  return {
    ...otherProps,
    // Disable custom selections during a search if `allowNew` isn't a function.
    allowNew: allowNew ? allowNew : allowNew && !isLoading,
    emptyLabel: getEmptyLabel(),
    isLoading,
    minLength,
    onInputChange: handleInputChange,
    options: useCache && cachedQuery ? cachedQuery : options,
  };
}

export function withAsync(Component: ComponentType<any>) {
  const AsyncTypeahead = forwardRef<any>((props, ref) => (
    <Component {...useAsync(props as any)} ref={ref} />
  ));

  return AsyncTypeahead;
}

export default function asyncContainer(Component: ComponentType<any>) {
  return withAsync(Component);
}
