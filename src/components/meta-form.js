import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import './meta-form.css';

const MetaForm = () => {
  const [indexes, setIndexes] = useState([]);
  const [counter, setCounter] = useState(0);
  const { register, handleSubmit } = useForm();

  const onSubmit = data => {
    console.log(data);
  };

  const addAttribute = () => {
    setIndexes(prevIndexes => [...prevIndexes, counter]);
    setCounter(prevCounter => prevCounter + 1);
  };

  const removeAttribute = index => () => {
    setIndexes(prevIndexes => [...prevIndexes.filter(item => item !== index)]);
    setCounter(prevCounter => prevCounter - 1);
  };

  const clearAttributes = () => {
    setIndexes([]);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {indexes.map(index => {
        const fieldName = `attributes[${index}]`;
        return (
          <fieldset name={fieldName} key={fieldName}>
            <label>
              First Name {index}:
              <input
                type="text"
                name={`${fieldName}.firstName`}
                {...register("firstName")}
              />
            </label>

            <label>
              Last Name {index}:
              <input
                type="text"
                name={`${fieldName}.lastName`}
                {...register("lastName")}
              />
            </label>
            <button type="button" onClick={removeAttribute(index)}>
              Remove
            </button>
          </fieldset>
        );
      })}

      <button type="button" onClick={addAttribute}>
        Add Attribute
      </button>
      <button type="button" onClick={clearAttributes}>
        Clear Attributes
      </button>
      <input type="submit" />
    </form>
  );
}

export default MetaForm;
