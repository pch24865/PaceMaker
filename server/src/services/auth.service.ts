import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import bcrypt from "bcrypt";

export async function checkSession(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(404, "로그인 인증 실패");
  }
  const userObj = user.toJSON();
  return userObj;
}

export async function signin(email, password) {
  // 입력 데이터 검증
  if (!email || !password) {
    throw new AppError(400, "이메일과 비밀번호를 입력해주세요");
  }
  // 사용자 찾기
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError(404, "이메일 또는 비밀번호를 다시 확인해주세요.");
  }
  // 비밀번호 찾기
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError(404, "이메일 또는 비밀번호를 다시 확인해주세요.");
  }
  // 로그인 성공 사용자정보 반환
  const userObj = user.toJSON();
  return userObj;
}

export async function signup(email, password, name) {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw AppError(409, "이미 존재하는 이메일입니다");
  }

  // bcrypt로 암호화
  const hashedPassword = await bcrypt.hash(password, 12);

  // user객체 생성 후 DB에 저장
  const user = new User({
    email,
    password: hashedPassword,
    name,
  });
  await user.save();

  // 사용자정보 반환
  const userObj = user.toJSON();
  return userObj;
}
