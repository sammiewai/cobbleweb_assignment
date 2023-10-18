const validatePassword = async (password) => {
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/i // Atleast a number and a letter.

  return pattern.test(password)
}

export { validatePassword }
