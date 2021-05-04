import React from 'react';
import styled from 'styled-components';
// eslint-disable-next-line import/no-extraneous-dependencies
import { action } from '@storybook/addon-actions';
import { Field } from 'react-final-form';
import { FormWithValidation } from '../lib/react-form-validation';
import { Code } from '../../react-code/lib/components/Code';

export default { title: 'FormWithValidation' };

const isInvalid = (meta) =>
  (meta.touched || meta.dirty) && !meta.data?.validating && !!meta.data?.error;

const getHelper = (meta) => {
  // Validation in progress
  if (meta.data?.validating) {
    return <p style={{ fontStyle: 'italic' }}>Validating...</p>;
  }

  // Error
  if (!meta.touched && !meta.dirty) return null;
  if (meta.data?.error) return meta.data?.error;
  return null;
};

const FieldWrapper = styled.div`
  margin-bottom: 1.5em;
`;

const submitAction = action('Submit');

export const primary = () => {
  const fieldsRules = {
    field1: {
      onChange: ({ value, setError }) => {
        if (!value) {
          setError('This field is required');
          return;
        }

        if (value.toLowerCase() === 'foo') {
          setError('No FOO!');
          return;
        }

        setError(null);
      },
    },
    field2: {
      onBlur: ({ value, setError, setFieldsValues }) => {
        if (!!value && typeof value === 'string')
          setFieldsValues({ values: { field2: value.toLowerCase() } });
        setError(null);
      },
    },
  };

  const submitRule = ({ values, setErrors }) => {
    if (
      values.field1.toLowerCase() === 'bar' &&
      values.field2.toLowerCase() === 'baz'
    ) {
      setErrors({
        field1: 'No BAR before BAZ',
        field2: 'No BAZ before BAR',
      });
    }

    setErrors({});
  };

  // eslint-disable-next-line react/prop-types
  const InputComponent = ({ input, meta }) => (
    <>
      <input
        {...input}
        style={{ borderColor: isInvalid(meta) ? 'red' : undefined }}
      />
      <span style={{ color: 'red' }}>{getHelper(meta)}</span>
    </>
  );

  return (
    <>
      <FormWithValidation
        onSubmit={(values) => submitAction(values)}
        fieldsRules={fieldsRules}
        submitRule={submitRule}
        render={({ submitErrors, submitting, canSubmit }) => (
          <>
            {submitErrors && <p style={{ color: 'red' }}>{submitErrors}</p>}

            <FieldWrapper>
              <Field name='field1'>{InputComponent}</Field>
            </FieldWrapper>

            <FieldWrapper>
              <Field name='field2'>{InputComponent}</Field>
            </FieldWrapper>

            <div>
              <button type='submit' disabled={!canSubmit}>
                Submit
                {submitting ? ' in progress...' : ''}
              </button>
            </div>
          </>
        )}
      />

      <Code>
        {`
          const isInvalid = (meta) =>
            (meta.touched || meta.dirty) && !meta.data?.validating && !!meta.data?.error;
          
          const getHelper = (meta) => {
            // Validation in progress
            if (meta.data?.validating) {
              return <p style={{ fontStyle: 'italic' }}>Validating...</p>;
            }
          
            // Error
            if (!meta.touched && !meta.dirty) return null;
            if (meta.data?.error) return meta.data?.error;
            return null;
          };        
        
          const fieldsRules = {
            field1: {
              onChange: ({ value, setError }) => {
                if (!value) {
                  setError('This field is required');
                  return;
                }
        
                if (value.toLowerCase() === 'foo') {
                  setError('No FOO!');
                  return;
                }
        
                setError(null);
              },
            },
            field2: {
              onBlur: ({ value, setError, setFieldsValues }) => {
                if (!!value && typeof value === 'string')
                  setFieldsValues({ values: { field2: value.toLowerCase() } });
                setError(null);
              },
            },
          };
        
          const submitRule = ({ values, setErrors }) => {
            if (
              values.field1.toLowerCase() === 'bar' &&
              values.field2.toLowerCase() === 'baz'
            ) {
              setErrors({
                field1: 'No BAR before BAZ',
                field2: 'No BAZ before BAR',
              });
            }
        
            setErrors({});
          };
        
          const InputComponent = ({ input, meta }) => (
            <>
              <input
                {...input}
                style={{ borderColor: isInvalid(meta) ? 'red' : undefined }}
              />
              <span style={{ color: 'red' }}>{getHelper(meta)}</span>
            </>
          );

          return <FormWithValidation
            onSubmit={submitFunction}
            fieldsRules={fieldsRules}
            submitRule={submitRule}
            render={({ submitErrors, submitting, canSubmit }) => (
              <>
                {submitErrors && <p style={{ color: 'red' }}>{submitErrors}</p>}
    
                <div>
                  <Field name='field1'>{InputComponent}</Field>
                </div>
    
                <div>
                  <Field name='field2'>{InputComponent}</Field>
                </div>
    
                <div>
                  <button type='submit' disabled={!canSubmit}>
                    Submit
                    {submitting ? ' in progress...' : ''}
                  </button>
                </div>
              </>
            )}
          />
        `}
      </Code>
    </>
  );
};
