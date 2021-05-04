# `@heetch/react-form-validation`

## Description

  Wrapper component around `react-final-form`. 
  
  Provides as way to display a form with custom validation rules:
  - allows for each field to specify a validation rule on value change, and/or on blur
  - allows to specify a validation rule to check before submitting
  - allows rules to populate form values
  - unifies how errors are passed to fields to render error messages and validity state

## Usage

  ```js
  const onSubmitFields = values => {
    // submitting values
  };

  const fieldsRules = {
    my_field: {
      onChange: ({ value, setError }) => {
        if (!/\d{4}/.test(value)) {
          setError('This field must contain 4 digits');
        } else {
          setError(null);
        }
      },
      onBlur: ({ value, setError, fieldState, skipValidation, setFieldsValues }) => {
        // do not validate if there is already an error due to onChange
        if (fieldState.data?.error) {
          skipValidation();
          return;
        }

        performAsyncValidation(value).then(({error, data}) => {
          if (error) {
            setError(error);
          } else {
            setError(null);
            setFieldsValues({values: {other_field: data}, setAsValid: true});
          }
        });
      }
    }
  };

  const submitRule = ({ values, setErrors }) => {
    const errors = validateAllValues(values); // errors is {[field_id]: error_message}
    setErrors(errors); // if errors object is empty, validation passes
  }

  <FormWithValidation
    onSubmit={onSubmitFields}
    fieldsRules={fieldsRules}
    submitRule={submitRule}
    validateFieldsOnFirstRun={{ onChange: true }}
    render={({ submitErrors, submitting, canSubmit }) => (
      <>
        <Field name='my_field'>
          {({ input, meta }) =>
            (
              <>
                <input {...input} type='text' id='my_field' invalid={!meta.pristine && !!meta.data?.error} />
                {meta.data?.error && <span>{meta.data?.error}</span>}
              </>
            );
          }}
        </Field>

        <Field name='other_field'>
          {({ input, meta }) =>
            (
              <>
                <input {...input} type='text' id='other_field' invalid={!meta.pristine && !!meta.data?.error} />
                {meta.data?.error && <span>{meta.data?.error}</span>}
              </>
            );
          }}
        </Field>

        {submitting && <div className='spinner' />}

        <button type='submit' disabled={!canSubmit}>Submit</button>
      </>
    )}
  />
  ```
