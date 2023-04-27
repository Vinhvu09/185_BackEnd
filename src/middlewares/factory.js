import _ from "lodash";

import { ERROR_CODE, LIMIT, PAGE } from "../constant/common.js";
import { catchErrorAsync } from "../utils/common.js";

function sanitizeBody(data, includeBody = []) {
  if (_.isEmpty(includeBody)) return data;

  return Object.keys(data || {}).reduce((obj, key) => {
    if (!includeBody.includes(key)) {
      obj[key] = data[key];
    }

    return obj;
  }, {});
}

export const findById = (Model) => {
  return catchErrorAsync(async (req, res, next) => {
    const { id } = req.params;
    const doc = await Model.findById(id);
    if (_.isEmpty(doc)) {
      return next(new ErrorMessage("Data not found", ERROR_CODE.notFound));
    }

    res.status(ERROR_CODE.OK).json({
      status: "success",
      data: doc,
    });
  });
};

export const findAll = (Model, search = {}) => {
  return catchErrorAsync(async (req, res, next) => {
    const { limit: limitParam, page, sortField, ...queries } = search;
    const limit = limitParam || LIMIT;
    const skip = ((page || PAGE) - 1) * limit;
    const sort = sortField || { createAt: -1 };
    const docs = await Model.find(queries).skip(skip).limit(limit).sort(sort);
    if (_.isEmpty(docs)) {
      return next(new ErrorMessage("Data not found", ERROR_CODE.notFound));
    }

    res.status(ERROR_CODE.OK).json({
      status: "success",
      total: docs.length,
      data: docs,
    });
  });
};

export const updateByIdOrCreate = (Model, isUpdate = true, includeBody) => {
  return catchErrorAsync(async (req, res, next) => {
    const body = sanitizeBody(req.body, includeBody);
    let doc = {};

    if (isUpdate) {
      const { id } = req.params;
      doc = await Model.findByIdAndUpdate(id, body, {
        runValidators: true,
        returnDocument: "after",
      });
    } else {
      doc = await Model.create(body);
    }

    res.status(ERROR_CODE.OK).json({
      status: "success",
      data: doc,
    });
  });
};

export const deleteById = (Model) => {
  return catchErrorAsync(async (req, res, next) => {
    const { id } = req.params;
    await Model.findByIdAndDelete(id);

    res.status(ERROR_CODE.noContent).json({
      status: "Success",
      data: null,
    });
  });
};
