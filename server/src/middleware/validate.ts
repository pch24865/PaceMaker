export default (schema) => (req, res, next) => {
    const result = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params,
    });
    if(!result.success) {
        const issues = result.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
        }));
        return res.status(400)on({
            error: "ValidationError", issues,
        });
    }
    Object.assign(req, result.data);
    next();
};

