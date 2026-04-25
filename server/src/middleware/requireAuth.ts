export const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401)on({
            success: false,
            message: "로그인이 필요한 서비스입니다.",
        });
    }
    next();
};
