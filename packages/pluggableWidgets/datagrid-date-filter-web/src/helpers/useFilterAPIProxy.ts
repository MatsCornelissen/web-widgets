import { useRef } from "react";
import { ListAttributeValue } from "mendix";
import { DispatchFilterUpdate, FilterContextValue } from "@mendix/widget-plugin-filtering";
import { InitCtxValues, translateFilters } from "../utils/filters";

interface PreparedCtx {
    dispatch: DispatchFilterUpdate;
    initValues: InitCtxValues | undefined;
    attributes: ListAttributeValue[];
}

interface PreparedCtxBox {
    current: PreparedCtx;
}

function usePreparedContext(ctx: FilterContextValue): PreparedCtxBox {
    const prev = useRef<PreparedCtx>();
    const value = (prev.current = mapContext(ctx, prev.current));
    const box = useRef(value);
    box.current = value;
    return box;
}

function mapContext(context: FilterContextValue, prev: PreparedCtx | undefined): PreparedCtx {
    return {
        dispatch: context.filterDispatcher,
        initValues: prev !== undefined ? prev.initValues : initValues(context),
        attributes: attributes(context)
    };
}

function initValues({ singleInitialFilter, multipleInitialFilters }: FilterContextValue): InitCtxValues | undefined {
    const [multiInitialFilter] = Object.values(multipleInitialFilters ?? {});
    return translateFilters(singleInitialFilter ?? multiInitialFilter);
}

function attributes(ctx: FilterContextValue): ListAttributeValue[] {
    let attrs = ctx.singleAttribute ? [ctx.singleAttribute] : [];
    attrs = ctx.multipleAttributes ? attrs.concat(findAttributesByType(ctx.multipleAttributes)) : attrs;
    return attrs;
}

function findAttributesByType(multipleAttributes: { [key: string]: ListAttributeValue }): ListAttributeValue[] {
    return Object.keys(multipleAttributes)
        .map(key => multipleAttributes[key])
        .filter(attr => attr.type === "DateTime");
}
