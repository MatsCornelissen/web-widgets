import { useState, useEffect } from "react";
import { FilterStore } from "./FilterStore";

export function useFilterStore(initState: () => FilterStore["state"]): FilterStore {
    const [{ store }, forceUpdate] = useState(() => {
        const store = new FilterStore(initState?.());
        store.addEventListener("change", () => forceUpdate({ store }));
        return { store };
    });

    useEffect(() => store.connected(), [store]);

    return store;
}
