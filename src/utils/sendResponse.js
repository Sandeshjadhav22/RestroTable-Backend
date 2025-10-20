export function ok(res, body = {}, message = "OK") {
  return res.status(200).json({ STATUS: "SUCCESS", MESSAGE: message, BODY: body });
}
export function created(res, body = {}, message = "Created") {
  return res.status(201).json({ STATUS: "SUCCESS", MESSAGE: message, BODY: body });
}
export function fail(res, code = 400, message = "Bad Request") {
  return res.status(code).json({ STATUS: "FAILURE", MESSAGE: message });
}
