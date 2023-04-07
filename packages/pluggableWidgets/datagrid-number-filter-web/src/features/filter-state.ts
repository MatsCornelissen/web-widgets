import { ChangeEventHandler, useState, useMemo, useRef, useEffect, MutableRefObject } from "react";
import { FilterType } from "../../typings/FilterType";
import { Big } from "big.js";
import { debounce, useEventCallback } from "@mendix/pluggable-widgets-commons";

type FilterState = {
    type: FilterType;
    inputValue: string;
};

type InputChangeHandler = ChangeEventHandler<HTMLInputElement>;

type TypeClickHandler = (type: FilterType) => void;

function updateState<K extends keyof S, V extends S[K], S>(key: K, value: V): (prev: S) => S {
    return prev => (prev[key] !== value ? { ...prev, [key]: value } : prev);
}

export function useFilterState(initialState: () => FilterState): [FilterState, InputChangeHandler, TypeClickHandler] {
    const [state, setState] = useState(initialState);
    const [onInputChange, onTypeClick] = useMemo(() => {
        const inputHandler: InputChangeHandler = event => setState(updateState("inputValue", event.target.value));
        const clickHandler: TypeClickHandler = type => setState(updateState("type", type));

        return [inputHandler, clickHandler];
    }, []);

    return [state, onInputChange, onTypeClick];
}

type ChangeDispatch = (value: Big | undefined, type: FilterType) => void;

export function useStateChangeEffects(
    state: FilterState,
    dispatch: ChangeDispatch
): [MutableRefObject<HTMLInputElement | null>] {
    const stableDispatch = useEventCallback(dispatch);
    const [stableDispatchDelayed] = useState(() => debounce(stableDispatch, 1000));
    const inputRef = useRef<HTMLInputElement | null>(null);
    const prevStateRef = useRef(state);

    useEffect(() => {
        const { current: prevState } = prevStateRef;
        if (state.type !== prevState.type) {
            stableDispatch(new Big(5), state.type);
            inputRef.current?.focus();
        } else if (state.inputValue !== prevState.inputValue) {
            stableDispatchDelayed(new Big(1), state.type);
        }
        prevStateRef.current = state;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state]);

    return [inputRef];
}
