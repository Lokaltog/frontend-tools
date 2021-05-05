import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Form, FormSpy } from 'react-final-form';
import { getIn } from 'final-form';
import PropTypes from 'prop-types';
import setFieldData from 'final-form-set-field-data';
import isEqual from 'lodash.isequal';

/**
 *  Custom mutators used to manipulate the form state programmatically
 */
const setFieldsValuesMutator = ([values], state, utils) => {
  Object.entries(values || {}).forEach(([field, value]) => {
    utils.changeValue(state, field, () => value);
  });
};

const setFieldTouchedMutator = ([name, touched], state) => {
  const field = state.fields[name];
  if (field) {
    field.touched = !!touched;
  }
};

/**
 * Spy component around the form (used as the target component of FormSpy)
 * @param active The active field that triggered the change from the FormSpy
 * @param form The form object
 * @param render The render function passed by the caller
 * @param fieldsRules Set of rules for validating individual fields, either on change or on blur
 * @param submitRule Rule to validate the whole form before submitting
 * @param validateFieldsOnFirstRun Tells if on change rules and/or on blur rules must be evaluated at the first form render
 * @param handleSubmit The submit function passed by the parent form
 */
const FormWithValidationComponent = ({
  active,
  form,
  render,
  fieldsRules,
  submitRule,
  validateFieldsOnFirstRun,
  handleSubmit,
}) => {
  const [field, setField] = useState();
  const [lastFieldValue, setLastFieldValue] = useState();
  const [lastFieldsValues, setLastFieldsValues] = useState({});
  const [validating, setValidating] = useState(false);
  const [hasErrors, setHasErrors] = useState(false);

  const { mutators, getFieldState, getRegisteredFields } = form;

  const formState = form.getState();
  const { values, submitting, pristine } = formState;

  const canSubmit = !submitting && !hasErrors && !validating && !pristine;

  const fieldState = getFieldState(field);
  const fieldRules = fieldsRules ? fieldsRules[field] : undefined;

  /**
   * Checks if any of the fields has a validation error in order to set the global error flag
   */
  const checkErrors = useMemo(() => {
    return () =>
      setHasErrors(
        getRegisteredFields().some((f) => getFieldState(f)?.data?.error),
      );
  }, [getRegisteredFields, getFieldState]);

  /**
   * Allows a validation rule to force values into the form. These values can also be marked as automatically valid.
   */
  const setFieldsValues = useMemo(() => {
    return ({ values: fieldsValues, setAsValid }) => {
      mutators.setFieldsValues(fieldsValues);
      if (setAsValid) {
        Object.keys(fieldsValues || {}).forEach((fieldId) => {
          mutators.setFieldData(fieldId, { error: null });
          mutators.setFieldTouched(fieldId, true);
        });
        setHasErrors(false);
      }
    };
  }, [mutators]);

  /**
   * Applies a validation rule for a given field
   */
  const applyRule = useMemo(() => {
    return (rule, fieldId) => {
      const value = getIn(values, fieldId);
      let isSync = false;

      const skipValidation = () => {
        mutators.setFieldData(fieldId, { validating: false });
        isSync = true;
        setValidating(false);
        checkErrors();
      };

      const setError = (error) => {
        mutators.setFieldData(fieldId, { error, validating: false });
        isSync = true;
        setValidating(false);
        checkErrors();
      };

      rule({
        value,
        values,
        fieldState,
        setError,
        skipValidation,
        setFieldsValues,
      });

      if (!isSync) {
        mutators.setFieldData(field, { validating: true });
        setValidating(true);
      }
    };
  }, [field, fieldState, mutators, values, setFieldsValues, checkErrors]);

  /**
   * The following effect is run in reaction to the active field changing or the form values changing.
   * This triggers either the onChange rules or the onBlur rules.
   */
  const isFirstRun = useRef(true);
  useEffect(() => {
    // On the first run only check rules if `validateFieldsOnFirstRun` says so
    if (isFirstRun.current) {
      if (validateFieldsOnFirstRun?.onChange) {
        Object.entries(fieldsRules).forEach(([fieldId, { onChange: rule }]) => {
          if (rule) applyRule(rule, fieldId);
        });
      }

      if (validateFieldsOnFirstRun?.onBlur) {
        Object.entries(fieldsRules).forEach(([fieldId, { onBlur: rule }]) => {
          if (rule) applyRule(rule, fieldId);
        });
      }

      checkErrors();

      isFirstRun.current = false;
      return;
    }

    /*
     * Detect which fields have been modified: this is only needed because of some custom fields (e.g. file drop zones)
     * do not trigger correctly the `active` state property, which means we cannot simply check if the active field has changed.
     */
    const changedFields = form.getRegisteredFields().filter((fieldId) => {
      /* eslint-disable no-prototype-builtins */
      return (
        (values.hasOwnProperty(fieldId) &&
          !lastFieldsValues.hasOwnProperty(fieldId)) ||
        (lastFieldsValues.hasOwnProperty(fieldId) &&
          !values.hasOwnProperty(fieldId)) ||
        !isEqual(lastFieldsValues[fieldId], values[fieldId])
      );
      /* eslint-enable no-prototype-builtins */
    });

    // Field onChange rules
    if (field && field === active && changedFields.includes(field)) {
      const rule = fieldRules?.onChange;
      if (rule) applyRule(rule, field);
    } else if (changedFields.length > 0) {
      // Some fields, like file drop zones, do not trigger the active prop, so we have to watch values diff
      Object.entries(fieldsRules).forEach(([fieldId, { onChange: rule }]) => {
        if (changedFields.includes(fieldId) && rule) applyRule(rule, fieldId);
      });
    }

    // Field onBlur rules
    if (field && field !== active) {
      const rule = fieldRules?.onBlur;
      if (rule) applyRule(rule, field);
    }

    setField(active);
    setLastFieldValue(values[active]);
    setLastFieldsValues(values);
  }, [
    active,
    field,
    form,
    values,
    lastFieldValue,
    lastFieldsValues,
    fieldRules,
    fieldsRules,
    applyRule,
    validateFieldsOnFirstRun,
    checkErrors,
  ]);

  /**
   * Handles "on submit" validation rule, if provided
   */
  const tryToSubmit = useMemo(() => {
    return () => {
      if (submitRule) {
        let isSync = false;

        const setErrors = (errors) => {
          Object.entries(errors || {}).forEach(([fieldId, error]) => {
            mutators.setFieldData(fieldId, { error, validating: false });
            mutators.setFieldTouched(fieldId, true);
          });
          const isValid = Object.values(errors).every((v) => !v);

          isSync = true;
          setValidating(false);
          setHasErrors(!isValid);

          if (isValid && !!handleSubmit) handleSubmit();
        };

        submitRule({ values, setErrors });

        if (!isSync) {
          setValidating(true);
        }
      } else if (!hasErrors && !validating && !!handleSubmit) {
        handleSubmit();
      }
    };
  }, [values, submitRule, mutators, hasErrors, validating, handleSubmit]);

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        tryToSubmit();
      }}
    >
      {render({ ...formState, hasErrors, validating, canSubmit })}
    </form>
  );
};

/**
 * Main component
 * @param render Renders the fields
 * @param onSubmit Submits form values if the form is valid
 * @param fieldsRules Set of rules for validating individual fields, either on change or on blur
 * @param submitRule Rule to validate the whole form before submitting
 * @param validateFieldsOnFirstRun Tells if on change rules and/or on blur rules must be evaluated at the first form render
 */
export const FormWithValidation = ({ onSubmit, ...props }) => (
  <Form
    onSubmit={onSubmit}
    mutators={{
      setFieldData,
      setFieldsValues: setFieldsValuesMutator,
      setFieldTouched: setFieldTouchedMutator,
    }}
    render={({ handleSubmit }) => (
      <FormSpy
        {...props}
        handleSubmit={handleSubmit}
        subscription={{ active: true, values: true }}
        component={FormWithValidationComponent}
      />
    )}
  />
);

/**
 * PropTypes
 */

const FieldsRules = PropTypes.objectOf(
  PropTypes.shape({
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
  }),
);

const ValidateFieldsOnFirstRun = PropTypes.shape({
  onChange: PropTypes.bool,
  onBlur: PropTypes.bool,
});

FormWithValidation.propTypes = {
  render: PropTypes.func,
  onSubmit: PropTypes.func,
  fieldsRules: FieldsRules,
  submitRule: PropTypes.func,
  validateFieldsOnFirstRun: ValidateFieldsOnFirstRun,
};

FormWithValidationComponent.propTypes = {
  active: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  form: PropTypes.object,
  render: PropTypes.func,
  fieldsRules: FieldsRules,
  submitRule: PropTypes.func,
  validateFieldsOnFirstRun: ValidateFieldsOnFirstRun,
  handleSubmit: PropTypes.func,
};
