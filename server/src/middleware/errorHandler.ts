export const errorHandler = (err, _req, res, _next) => {
    const status = err.statusCode || 500;
    const message = err.message || "서버에 오류가 발생하였습니다.";

    res.status(status).json({
        success: false,
        message: message,
    });
};