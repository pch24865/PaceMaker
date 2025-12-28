import Party from "../models/Party.ts";
import mongoose from "mongoose";
import AppError from "../utils/AppError.js";

// 파티 목록 조회 (페이지네이션, 검색)
export async function getPartys(page, search) {
  const perPage = 12;
  const query = { title: new RegExp(search, "i") };
  const skip = (page - 1) * perPage;
  const parties = await Party.find(query)
    .populate({
      path: "participants userId",
      select: "name -_id",
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(perPage);
  const totalCount = await Party.countDocuments(query);
  const result = {
    parties,
    lastPage: Math.ceil(totalCount / perPage),
  };
  return result;
}

// 파티 생성
export async function createParty(
  userId,
  title,
  category,
  content,
  tag,
  startDate,
  maximumCapacity,
  requiresApproval,
  isOffline,
  locate
) {
    const party = new Party({
        userId, // 자동으로 형변환 됨 (-> ObjectId(userId))
        title,
        category,
        content,
        tag,
        startDate,
        maximumCapacity,
        participants: [userId],
        requiresApproval,
        isOffline,
        locate,
    });
    await party.save();
    return party;
}

// 파티 삭제
export async function deleteParty(userId, partyId) {
    const party = await Party.findById(partyId);
    if(party.userId !== userId) {
        throw new AppError(401, "권한이 없습니다.");
    }
    return party;
}