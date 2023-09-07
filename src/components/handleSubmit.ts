export const { handleSubmit, resetForm } = useForm({
  validationSchema: toTypedSchema(
    object({
      text: string({ required_error: "Can't have an empty todo, can you ?" }).min(1)
    })
  )
});
