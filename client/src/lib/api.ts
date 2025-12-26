import axios from 'axios';

const API_BASE_URL = '';

// Shared Interfaces
export interface User {
    _id: string;
    name: string;
    email: string;
}

export interface Note {
    _id: string;
    title: string;
    theme: string;
    tag: string;
    contents: Array<any>; // BlockNote content structure is complex, keeping as dynamic array for now or could infer from usage
}

export interface OpenedNote {
    noteId: string;
    x: number;
    y: number;
    width: number;
    height: number;
    xRate: number;
    yRate: number;
    widthRate: number;
    heightRate: number;
    zIndex: number;
    fullScreen: boolean;
}

// Request Interfaces
export interface SignInRequest {
    email: string;
    password: string;
}

export interface SignUpRequest {
    email: string;
    password: string;
    passwordConfirm: string;
    name: string;
}

export interface CreateNoteRequest {
    title: string;
    theme: string;
    tag: string;
}

export interface SaveNoteRequest {
    id: string;
    title: string;
    theme: string;
    tag: string;
    contents: Array<any>;
}

export interface DeleteNoteRequest {
    id: string;
}

export interface SaveLayoutRequest {
    openedNotes: Partial<OpenedNote>[];
}

// Response Interfaces
export interface AuthResponse {
    message?: string;
    user: User;
}

export interface NoteListResponse {
    notes: Note[];
}

export interface NoteResponse {
    note: Note;
}

export interface LayoutResponse {
    noteWorkspace: {
        openedNotes: OpenedNote[];
    };
}

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            window.location.href = "/signin";
        }
        return Promise.reject(error);
    }
)

// 로그인
export const signin = async (data: SignInRequest): Promise<AuthResponse> => {
    const res = await api.post('/api/signin', data);
    return res.data;
}

// 회원가입
export const signup = async (data: SignUpRequest): Promise<void> => {
    const res = await api.post('/api/signup', data);
    return res.data;
}

// 로그아웃
export const signout = async (): Promise<void> => {
    const res = await api.post('/api/signout');
    return res.data;
}

// 세션 확인
export const getUser = async (): Promise<AuthResponse> => {
    const res = await api.get('/api/auth/me');
    return res.data;
}

// 노트 조회
export const getNotes = async (): Promise<NoteListResponse> => {
    const res = await api.get('/api/notes');
    return res.data;
}

// 노트 한 개 저장
export const saveNote = async (data: SaveNoteRequest): Promise<NoteResponse> => {
    const res = await api.patch(`/api/notes/${data.id}`, data);
    return res.data;
}

// 노트 레이아웃 저장
export const saveNoteLayout = async (data: SaveLayoutRequest): Promise<void> => {
    const res = await api.patch('/api/note-layouts', data);
    return res.data;
}

// 노트 레이아웃 조회
export const getNoteLayout = async (): Promise<LayoutResponse> => {
    const res = await api.get('/api/note-layouts');
    return res.data;
}

// 노트 생성
export const createNote = async (data: CreateNoteRequest): Promise<CreateNoteRequest & { note: Note }> => {
    const res = await api.post('/api/notes', data);
    return res.data;
}

// 노트 한개 삭제
export const deleteNote = async (data: DeleteNoteRequest): Promise<void> => {
    const res = await api.delete(`/api/notes/${data.id}`, { data });
    return res.data;
}