import {
    ActionValue,
    ReferenceValue,
    ReferenceSetValue,
    ListValue,
    ListAttributeValue,
    ListExpressionValue,
    DynamicValue
} from "mendix";
import { ComboboxContainerProps, FilterTypeEnum } from "../../../typings/ComboboxProps";

type ExtractionReturnValue = [
    ReferenceValue | ReferenceSetValue,
    ListValue,
    ListAttributeValue<string> | ListExpressionValue<string> | undefined,
    DynamicValue<string> | undefined,
    boolean,
    FilterTypeEnum,
    ActionValue | undefined
];

export function extractAssociationProps(props: ComboboxContainerProps): ExtractionReturnValue {
    const attr = props.attributeAssociation;
    const filterType = props.filterType;
    const onChangeEvent = props.onChangeEvent;

    if (!attr) {
        throw new Error("'optionsSourceType' type is 'association' but 'attributeAssociation' is not defined.");
    }

    const ds = props.optionsSourceAssociationDataSource;
    if (!ds) {
        throw new Error(
            "'optionsSourceType' type is 'association' but 'optionsSourceAssociationDataSource' is not defined."
        );
    }
    const captionType = props.optionsSourceAssociationCaptionType;
    const captionAttribute = props.optionsSourceAssociationCaptionAttribute;
    const captionExpression = props.optionsSourceAssociationCaptionExpression;

    if (captionType === "attribute" && !captionAttribute) {
        throw new Error(
            "'optionsSourceAssociationCaptionType' type is 'attribute' but 'optionsSourceAssociationCaptionAttribute' is not defined."
        );
    }
    if (captionType === "expression" && !captionExpression) {
        throw new Error(
            "'optionsSourceAssociationCaptionType' type is 'expression' but 'optionsSourceAssociationCaptionExpression' is not defined."
        );
    }
    const emptyOption = props.emptyOptionText;
    const clearable = props.clearable;

    return [
        attr,
        ds,
        captionType === "attribute" ? captionAttribute! : captionExpression!,
        emptyOption,
        clearable,
        filterType,
        onChangeEvent
    ];
}
