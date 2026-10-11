const isObjectId = (id) => typeof id === "string" && /^[0-9a-f]{24}$/i.test(id);
export default isObjectId;
