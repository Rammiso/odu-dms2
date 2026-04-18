import { User } from "../models/User.js";

export const userRepository = {
  findByEmail: (email, options = {}) => {
    const query = User.findOne({ email });

    if (options.includePassword) {
      query.select("+password");
    }

    return query;
  },
  findById: (id) => User.findById(id).select("-password"),
  create: (payload) => User.create(payload),
};
