import classNames from "classnames";
import { createRef } from "react";
import ReactDatePicker, { ReactDatePickerProps } from "react-datepicker";
import { DatagridDateFilterContainerProps, DefaultFilterEnum } from "../../typings/DatagridDateFilterProps";
import { dayOfWeekWhenUpperCase, doubleMonthOrDayWhenSingle } from "../utils/date-utils";

export class DatePickerController extends EventTarget {
    state: {
        open: boolean;
    } = { open: false };

    pickerRef: React.RefObject<ReactDatePicker>;
    popoverContainerRef: React.RefObject<HTMLDivElement>;
    buttonRef: React.RefObject<HTMLButtonElement>;

    #filterType: DefaultFilterEnum;

    readonly #popoverContainerId = `datepicker_` + Math.random();
    readonly #adjustable: boolean;
    readonly #dateFormat: string | string[];

    constructor(props: DatagridDateFilterContainerProps) {
        super();
        this.buttonRef = createRef();
        this.popoverContainerRef = createRef();
        this.pickerRef = createRef();
        this.#adjustable = props.adjustable;
        this.#dateFormat = this.getDateFormat();
        this.#filterType = props.defaultFilter;
    }

    get pickerProps(): DatePickerProps {
        return {
            allowSameDay: false,
            autoFocus: false,
            className: classNames("form-control", { "filter-input": this.#adjustable }),
            dateFormat: this.#dateFormat,
            shouldCloseOnSelect: false,
            showMonthDropdown: true,
            showPopperArrow: false,
            showYearDropdown: true,
            strictParsing: true,
            useWeekdaysShort: false,
            readOnly: this.#useRange,
            ref: this.pickerRef
        };
    }

    get popoverContainerProps(): PopoverContainerProps {
        return {
            ref: this.popoverContainerRef,
            id: this.#popoverContainerId,
            className: "data-filter-container"
        };
    }

    get #useRange(): boolean {
        return this.#filterType === "between";
    }

    getDateFormat(): string | string[] {
        const {
            patterns: { date: appDateFormat }
        } = window.mx.session.getConfig().locale;
        let dateFormat: string | string[];
        // Replace with full patterns d -> dd, M -> MM
        dateFormat = doubleMonthOrDayWhenSingle(appDateFormat);
        // Replace Date format E to follow unicode standard (e...eeee)
        dateFormat = dayOfWeekWhenUpperCase(dateFormat);
        // Use multiple formats if formats not equal
        dateFormat = dateFormat === appDateFormat ? dateFormat : [dateFormat, appDateFormat];
        return dateFormat;
    }

    componentDidUpdate(): void {}
}

interface PopoverContainerProps {
    ref: React.RefObject<HTMLDivElement>;
    id: string;
    className: string;
}

interface DatePickerProps extends ReactDatePickerProps, React.ClassAttributes<ReactDatePicker> {}
