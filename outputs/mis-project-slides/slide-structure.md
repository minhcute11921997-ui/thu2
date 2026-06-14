# Cau truc slide thuyet trinh du an MIS - LocalAI DocManager

So luong de xuat: 22 slide  
Huong trinh bay: ky thuat + demo san pham  
Muc tieu: giai thich bai toan, kien truc, luong RAG, dataset, frontend, van hanh va cac cai tien da lam.

## Slide 01 - LocalAI DocManager

**Muc tieu:** Gioi thieu ten du an va dinh vi san pham.

**Noi dung chinh:**
- Tro ly hoi dap tai lieu noi bo bang RAG.
- Chay cuc bo, khong gui du lieu ra ngoai.
- Cau tra loi phai co trich dan nguon.

**Bo cuc/visual:**
- Slide bia nen toi.
- Tieu de lon: `LocalAI DocManager`.
- 3 nhan cong nghe: `FastAPI + React/Tauri`, `ChromaDB + Ollama`, `Qwen3.5:9b`.

**Ghi chu noi:** Du an tap trung vao truy van tai lieu noi bo co kiem chung, khong phai chatbot tra loi tu kien thuc mo hinh.

## Slide 02 - Bai toan can giai quyet

**Muc tieu:** Lam ro ly do can he thong.

**Noi dung chinh:**
- Tai lieu nam rai rac theo nhieu dinh dang.
- Tim dung can cu mat thoi gian va de nham ngu canh.
- Cau hoi can phan tich nhung van phai bam nguon.
- Du lieu noi bo khong nen gui len dich vu AI cong khai.

**Bo cuc/visual:**
- Chia 2 cot: `Dau diem hien tai` va `Muc tieu san pham`.

**Ghi chu noi:** Neu chi dung LLM thuong, cau tra loi co the nghe hop ly nhung khong kiem chung duoc.

## Slide 03 - Luan diem thiet ke

**Muc tieu:** Neu nguyen tac cot loi cua san pham.

**Noi dung chinh:**
- He thong khong thay the chuyen gia.
- He thong giup truy xuat chung cu, tong hop va lap luan nhanh hon.
- LLM chi phan tich tren can cu da truy xuat.
- Neu thieu tai lieu phu hop thi phai noi khong du can cu.

**Bo cuc/visual:**
- Cau thong diep lon ben trai.
- Khoi visual ben phai: `RAG cuc bo`.

**Ghi chu noi:** Day la diem khac biet giua chatbot thong thuong va tro ly tai lieu co citation.

## Slide 04 - Nguoi dung va tinh huong su dung

**Muc tieu:** Cho thay cac nhom nguoi dung co the ap dung.

**Noi dung chinh:**
- Phap che: hoi dieu luat, doi chieu tinh huong, trich nguon.
- Nhan su: tra cuu quy che, hop dong lao dong, chinh sach.
- Tai chinh: tom tat bao cao, kiem chung bang so lieu.
- Quan tri: quan ly dataset, xoa file cu, kiem soat pham vi chat.

**Bo cuc/visual:**
- 4 o theo dang 2x2.

**Ghi chu noi:** Mot he thong tot phai vua phuc vu nguoi hoi, vua cho phep quan tri du lieu.

## Slide 05 - Yeu cau chuc nang va phi chuc nang

**Muc tieu:** Tong hop yeu cau he thong.

**Noi dung chinh:**
- Chuc nang: upload file, parse, chunk, luu dataset, hoi dap, citation, nhieu cuoc tro chuyen.
- Phi chuc nang: chay local, khong suy dien ngoai dataset, xoa sach vector khi xoa file, rollback khi loi.

**Bo cuc/visual:**
- 2 cot: `Chuc nang` va `Phi chuc nang`.

**Ghi chu noi:** Cac yeu cau phi chuc nang quan trong vi lien quan truc tiep den do tin cay cua cau tra loi.

## Slide 06 - Kien truc tong the

**Muc tieu:** Giai thich cac thanh phan chinh.

**Noi dung chinh:**
- Frontend React/Tauri.
- Backend FastAPI.
- Document Parser.
- ChromaDB Vector Store.
- Ollama + Qwen3.5.

**Bo cuc/visual:**
- So do dong chay tu trai sang phai.
- Them ghi chu duoi so do ve vai tro tung lop.

**Ghi chu noi:** Frontend chi hien thi va dieu phoi UX; backend moi la noi giu logic RAG va dataset.

## Slide 07 - Luong nap tai lieu

**Muc tieu:** Mo ta quy trinh dua file vao dataset.

**Noi dung chinh:**
- Upload.
- Nhan dien dinh dang.
- Parse text.
- Chia chunk.
- Tao embedding.
- Luu ChromaDB.
- Luu file goc.

**Bo cuc/visual:**
- Pipeline 7 buoc.
- Callout duoi: neu loi parser/indexing thi cleanup de dataset khong bi lech.

**Ghi chu noi:** Viec cleanup quan trong de tranh file mo coi hoac vector mo coi.

## Slide 08 - Luong hoi dap

**Muc tieu:** Giai thich query di qua RAG nhu the nao.

**Noi dung chinh:**
- Nhan cau hoi.
- Tach keyword terms.
- Tim candidate.
- Chon evidence.
- Tao prompt.
- Goi Qwen.
- Kiem tra citation.

**Bo cuc/visual:**
- Pipeline 7 buoc.
- Callout: cau tra loi cuoi phai dua tren evidence.

**Ghi chu noi:** Diem quan trong la retrieval phai loc dung truoc khi LLM phan tich.

## Slide 09 - Quan ly dataset

**Muc tieu:** Lam ro them/xoa file anh huong gi.

**Noi dung chinh:**
- Them file: luu file vao uploads, parse text, ghi chunks vao Chroma.
- Xoa file: xoa chunks theo document_id va xoa file goc.
- Them lai: tao document_id moi de tranh de nham vector cu.
- Loi nap: rollback de khong con trang thai nua voi.

**Bo cuc/visual:**
- 4 o: them file, xoa file, them lai, loi nap.

**Ghi chu noi:** Dataset can nhat quan giua file goc, metadata va vector.

## Slide 10 - Dinh dang dau vao da mo rong

**Muc tieu:** Neu nang luc xu ly nhieu loai file.

**Noi dung chinh:**
- Van ban: PDF, DOCX, TXT, MD, RTF.
- Trinh chieu: PPTX.
- Bang tinh: XLSX, XLSM, CSV, TSV.
- Du lieu: JSON, XML, HTML.
- Ma nguon: PY, JS, TS, JSX, TSX, SQL, YAML, CSS.
- Scan PDF: OCR fallback neu co Tesseract.

**Bo cuc/visual:**
- Matrix 6 nhom dinh dang.

**Ghi chu noi:** File scan PDF khac PDF text; muon doc scan can OCR.

## Slide 11 - Trai nghiem frontend

**Muc tieu:** Tom tat cac cai tien UI/chat.

**Noi dung chinh:**
- Nhieu cuoc tro chuyen khac nhau.
- Noi dung moi chat gioi han theo conversation context.
- Textarea tu wrap va autosize.
- Enter de gui, Shift+Enter de xuong dong.
- Tab Bo du lieu de upload/xoa/tom tat.
- Dashboard xem thong ke DB.

**Bo cuc/visual:**
- Danh sach tinh nang hoac mockup 3 vung: sidebar chat, khung chat, dataset.

**Ghi chu noi:** Nhieu conversation giup tranh lan ngu canh giua cac chu de khac nhau.

## Slide 12 - Nguyen tac tra loi co can cu

**Muc tieu:** Dat ky vong ve chat luong cau tra loi.

**Noi dung chinh:**
- Khong dung kien thuc ngoai dataset lam can cu chinh.
- Moi ket luan quan trong can co `[Nguon: file, doan N]`.
- Khong bia dieu luat, muc phat, so lieu neu file khong co.
- Duoc phan tich tinh huong, nhung phai chi ro can cu nao ho tro.

**Bo cuc/visual:**
- Danh sach 4 nguyen tac.

**Ghi chu noi:** "Duoc suy luan" khong co nghia la "duoc tuong tuong"; suy luan phai co evidence.

## Slide 13 - Vi sao cau hoi "giet nguoi thuoc toi gi" tung bi lech?

**Muc tieu:** Giai thich ro loi retrieval da gap.

**Noi dung chinh:**
- Dataset khi do chi co luat lao dong/dan su.
- Cau hoi thuoc linh vuc hinh su.
- Retrieval nguyen ban bi keo nham boi cac tu chung nhu `nguoi`, `thuoc`, `toi`.
- He thong da tang loc lexical/strict terms.
- Neu khong co Bo luat Hinh su hoac doan lien quan, phai tra loi khong tim thay can cu.

**Bo cuc/visual:**
- 2 cot: `Truoc` va `Sau cai thien`.

**Ghi chu noi:** Loi nay khong nam o Qwen don thuan; phan lon do retrieval dua sai evidence vao prompt.

## Slide 14 - Vi sao tinh huong mua laptop tra loi tot hon?

**Muc tieu:** So sanh voi truong hop cau hoi phu hop dataset.

**Noi dung chinh:**
- Cau hoi co du kien dan su: giao dich, thoa thuan, tai san, tin nhan, thanh toan.
- Dataset dan su co doan lien quan hon.
- Mo hinh co the phan tich hop phap ve hinh thuc va gioi han ket luan.
- Van can them chung cu cu the neu muon ket luan tranh chap.

**Bo cuc/visual:**
- 2 cot: `Du lieu phu hop` va `Ket luan co gioi han`.

**Ghi chu noi:** Ket qua tot khi dataset dung linh vuc va evidence du gan voi cau hoi.

## Slide 15 - Lop mo hinh suy luan

**Muc tieu:** Neu cach goi LLM va cac rao chan.

**Noi dung chinh:**
- Model: qwen3.5:9b qua Ollama.
- API: `/api/chat`.
- `think=false` de giam phan noi bo.
- Lam sach the `<think>`.
- Timeout 180 giay.
- Prompt bat buoc bam evidence va citation.

**Bo cuc/visual:**
- Bang 2 cot: hang muc va mo ta.

**Ghi chu noi:** Model chi la mot lop trong pipeline; prompt va evidence moi quyet dinh do dung.

## Slide 16 - Quyen rieng tu va kiem soat du lieu

**Muc tieu:** Nhieu manh gia tri cua chay local.

**Noi dung chinh:**
- Chay local, khong can gui file ra ngoai.
- Vector store nam trong `backend/data`.
- File goc nam trong `backend/uploads`.
- Co the xoa tung document khoi ca file store va Chroma.
- Phu hop demo noi bo hoac du lieu nhay cam.

**Bo cuc/visual:**
- Danh sach 5 diem, co icon lock/database neu can.

**Ghi chu noi:** Loi ich cua local AI khong chi la chi phi, ma con la kiem soat du lieu.

## Slide 17 - Stack ky thuat

**Muc tieu:** Tom tat cong nghe da dung.

**Noi dung chinh:**
- Backend: FastAPI, Python, PyMuPDF, python-docx, openpyxl, python-pptx.
- AI/RAG: Ollama, Qwen3.5:9b, sentence-transformers, ChromaDB.
- Frontend: React, TypeScript, Vite, Tauri.
- Van hanh: venv, npm, local ports 8000/5173.

**Bo cuc/visual:**
- 4 cot ung voi 4 lop cong nghe.

**Ghi chu noi:** Stack du gon de chay local nhung van co day du parse, vector search va UI.

## Slide 18 - Kiem thu va xac nhan

**Muc tieu:** Chung minh du an da duoc verify co ban.

**Noi dung chinh:**
- Frontend build thanh cong bang `npm run build`.
- Backend compile Python thanh cong.
- Upload/list/delete file da duoc kiem thu.
- Scan PDF loi duoc cleanup.
- Query khong co can cu khong con tra loi lech.
- Qwen3.5:9b da phan hoi qua Ollama.

**Bo cuc/visual:**
- Checklist 6 muc.

**Ghi chu noi:** Kiem thu tap trung vao cac diem co rui ro cao: dataset lifecycle va retrieval sai nguon.

## Slide 19 - Rui ro con lai

**Muc tieu:** Trinh bay trung thuc gioi han he thong.

**Noi dung chinh:**
- Thieu tai lieu dung linh vuc: phai tu choi thay vi doan.
- PDF scan: can Tesseract de OCR.
- Retrieval nhieu: can debug UI va reranker.
- Model nho: co the yeu voi cau hoi phap ly phuc tap.
- Citation chua du min: can UI xem doan nguon truc tiep.

**Bo cuc/visual:**
- Risk register 5 o: rui ro va cach giam thieu.

**Ghi chu noi:** Slide nay giup hoi dong thay du an co nhan dien rui ro, khong trinh bay qua da.

## Slide 20 - Roadmap cai tien

**Muc tieu:** Neu cac buoc phat trien tiep theo.

**Noi dung chinh:**
- Bo loc theo file/chu de.
- OCR setup wizard.
- Reranker cross-encoder.
- Trang xem citation.
- Conversation memory theo dataset.
- Export bao cao hoi dap.

**Bo cuc/visual:**
- Timeline 6 buoc.

**Ghi chu noi:** Uu tien tiep theo nen la debug retrieval va xem citation, vi day la nguon chinh cua cau tra loi lech.

## Slide 21 - Cach chay du an

**Muc tieu:** Dua runbook ngan gon cho demo.

**Noi dung chinh:**
- Backend:
  `cd backend; .\.venv\Scripts\activate; python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000`
- Frontend:
  `cd frontend; npm run dev -- --host 127.0.0.1`
- Model:
  `ollama pull qwen3.5:9b; ollama serve`

**Bo cuc/visual:**
- 3 khoi lenh dang terminal.

**Ghi chu noi:** Truoc khi demo can dam bao Ollama dang chay va model da duoc pull.

## Slide 22 - Thong diep ket thuc

**Muc tieu:** Ket lai gia tri cua du an.

**Noi dung chinh:**
- Du an bien mot thu muc tai lieu thanh tro ly hoi dap co kiem chung.
- Gia tri chinh: nhanh hon, rieng tu hon, kiem chung duoc.
- Gioi han chinh: khong co tai lieu thi khong duoc doan.
- Demo tot nhat: upload dung bo tai lieu, hoi tinh huong, mo citation.

**Bo cuc/visual:**
- Cau thong diep lon o giua.
- 3 bullet gia tri.
- Nut/callout: `Demo: upload -> hoi -> kiem chung nguon`.

**Ghi chu noi:** Ket luan bang nguyen tac quan trong nhat: cau tra loi phai truy ve duoc nguon.

