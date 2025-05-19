import * as y from "yup";

export const authSchema = y.object().shape({
  email: y.string().email().required(),
  password: y.string().required(),
});
