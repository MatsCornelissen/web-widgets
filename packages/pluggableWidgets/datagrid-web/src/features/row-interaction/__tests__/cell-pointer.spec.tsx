import { createElement } from "react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { render, renderHook, RenderResult } from "@testing-library/react";
import { useEventSwitch } from "@mendix/widget-plugin-grid/event-switch/use-event-switch";
import { createActionHandlers } from "../action-handlers";
import { createSelectHandlers } from "../select-handlers";
import { CellContext, ClickTrigger, SelectionMethod } from "../base";
import { objectItems } from "@mendix/widget-plugin-test-utils";

function setup(jsx: React.ReactElement): { user: UserEvent } & RenderResult {
    return {
        user: userEvent.setup(),
        ...render(jsx)
    };
}

describe("grid cell", () => {
    describe("on click event", () => {
        const cases = [
            { ct: "single", sm: "rowClick", method: "none" },
            { ct: "double", sm: "rowClick", method: "onSelect" },
            { ct: "none", sm: "rowClick", method: "onSelect" },
            { ct: "single", sm: "checkbox", method: "onExecuteAction" },
            { ct: "double", sm: "checkbox", method: "none" },
            { ct: "none", sm: "checkbox", method: "none" },
            { ct: "single", sm: "none", method: "onExecuteAction" },
            { ct: "double", sm: "none", method: "none" },
            { ct: "none", sm: "none", method: "none" }
        ];

        test.each(cases)(
            "calls $method when selection method is $sm and click trigger is $ct",
            async ({ ct, sm, method }) => {
                const onExecuteAction = jest.fn();
                const onSelect = jest.fn();

                const [item] = objectItems(1);

                const props = renderHook(() =>
                    useEventSwitch<CellContext, HTMLDivElement>(
                        (): CellContext => ({
                            item,
                            selectionMethod: sm as SelectionMethod,
                            clickTrigger: ct as ClickTrigger
                        }),
                        () => [...createActionHandlers(onExecuteAction), ...createSelectHandlers(onSelect)]
                    )
                ).result.current;

                const { user, getByRole } = setup(<div role="gridcell" {...props} />);
                await user.click(getByRole("gridcell"));

                if (method === "none") {
                    expect(onExecuteAction).toHaveBeenCalledTimes(0);
                    expect(onSelect).toHaveBeenCalledTimes(0);
                } else if (method === "onSelect") {
                    expect(onExecuteAction).toHaveBeenCalledTimes(0);
                    expect(onSelect).toHaveBeenCalledTimes(1);
                    expect(onSelect).toHaveBeenLastCalledWith(item, false);
                } else {
                    expect(onExecuteAction).toHaveBeenCalledTimes(1);
                    expect(onExecuteAction).toHaveBeenLastCalledWith(item);
                    expect(onSelect).toHaveBeenCalledTimes(0);
                }
            }
        );
    });

    describe("on shift+click event", () => {
        const cases = [
            { ct: "single", sm: "rowClick", method: "none" },
            { ct: "double", sm: "rowClick", method: "onSelect" },
            { ct: "none", sm: "rowClick", method: "onSelect" },
            { ct: "single", sm: "checkbox", method: "onExecuteAction" },
            { ct: "double", sm: "checkbox", method: "none" },
            { ct: "none", sm: "checkbox", method: "none" },
            { ct: "single", sm: "none", method: "onExecuteAction" },
            { ct: "double", sm: "none", method: "none" },
            { ct: "none", sm: "none", method: "none" }
        ];

        test.each(cases)(
            "calls $method when selection method is $sm and click trigger is $ct",
            async ({ ct, sm, method }) => {
                const onExecuteAction = jest.fn();
                const onSelect = jest.fn();

                const [item] = objectItems(1);

                const props = renderHook(() =>
                    useEventSwitch<CellContext, HTMLDivElement>(
                        (): CellContext => ({
                            item,
                            selectionMethod: sm as SelectionMethod,
                            clickTrigger: ct as ClickTrigger
                        }),
                        () => [...createActionHandlers(onExecuteAction), ...createSelectHandlers(onSelect)]
                    )
                ).result.current;

                const { user, getByRole } = setup(<div role="gridcell" {...props} />);
                await user.keyboard("{Shift>}");
                await user.click(getByRole("gridcell"));
                await user.keyboard("{/Shift}");

                if (method === "none") {
                    expect(onExecuteAction).toHaveBeenCalledTimes(0);
                    expect(onSelect).toHaveBeenCalledTimes(0);
                } else if (method === "onSelect") {
                    expect(onExecuteAction).toHaveBeenCalledTimes(0);
                    expect(onSelect).toHaveBeenCalledTimes(1);
                    expect(onSelect).toHaveBeenLastCalledWith(item, true);
                } else {
                    expect(onExecuteAction).toHaveBeenCalledTimes(1);
                    expect(onExecuteAction).toHaveBeenLastCalledWith(item);
                    expect(onSelect).toHaveBeenCalledTimes(0);
                }
            }
        );
    });

    describe("on dblclick event", () => {
        const cases = [
            { ct: "single", sm: "rowClick", n: 0 },
            { ct: "double", sm: "rowClick", n: 1 },
            { ct: "none", sm: "rowClick", n: 0 },
            { ct: "single", sm: "checkbox", n: 2 },
            { ct: "double", sm: "checkbox", n: 1 },
            { ct: "none", sm: "checkbox", n: 0 },
            { ct: "single", sm: "none", n: 2 },
            { ct: "double", sm: "none", n: 1 },
            { ct: "none", sm: "none", n: 0 }
        ];

        test.each(cases)(
            "calls onExecuteAction $n times when selection method is $sm and click trigger is $ct",
            async ({ ct, sm, n }) => {
                const onExecuteAction = jest.fn();

                const [item] = objectItems(1);

                const props = renderHook(() =>
                    useEventSwitch<CellContext, HTMLDivElement>(
                        (): CellContext => ({
                            item,
                            selectionMethod: sm as SelectionMethod,
                            clickTrigger: ct as ClickTrigger
                        }),
                        () => [...createActionHandlers(onExecuteAction)]
                    )
                ).result.current;

                const { user, getByRole } = setup(<div role="gridcell" {...props} />);
                await user.dblClick(getByRole("gridcell"));

                expect(onExecuteAction).toHaveBeenCalledTimes(n);
                if (n > 0) {
                    expect(onExecuteAction).toHaveBeenLastCalledWith(item);
                }
            }
        );
    });
});
