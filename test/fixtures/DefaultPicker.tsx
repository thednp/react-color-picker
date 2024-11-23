import { ForwardedRef, forwardRef, useRef } from "react";
import { type ColorPickerProps, DefaultColorPicker } from "~/index";

const DefaultPicker = forwardRef((props: ColorPickerProps, ref: ForwardedRef<HTMLDivElement>) => {
    const {id, ...others} = props;
    const mainRef = ref || useRef(null);
    const ID = id || "test-color-picker";

    return (
        <>
            <label htmlFor={ID}>Default Color Picker</label>
            <DefaultColorPicker ref={mainRef} id={ID} { ...others } />
        </>
    )
})

export default DefaultPicker;
