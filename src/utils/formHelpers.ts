
export const createCheckboxChangeHandler = (onChange: (value: boolean) => void) => {
  return (checked: boolean | "indeterminate") => {
    onChange(checked === true);
  };
};

export const createFieldChangeHandler = <T>(
  field: string,
  onChange: (field: string, value: T) => void
) => {
  return (value: T) => {
    onChange(field, value);
  };
};
