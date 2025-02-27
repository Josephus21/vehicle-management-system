import React from "react";
import MainTable from "./Table/Table";
import { FormProvider, useForm } from "react-hook-form";

export default function LastikIslemleri() {
  const formMethods = useForm();
  return (
    <FormProvider {...formMethods}>
      <div>
        <MainTable />
      </div>
    </FormProvider>
  );
}
