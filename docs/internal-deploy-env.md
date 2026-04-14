# 鍐呴儴涓婄嚎鐜鍙橀噺涓庤縼绉昏鏄?

## 鍚庣蹇呭～鐜鍙橀噺

鍦?`apps/backend/server` 鎵€鍦ㄨ繍琛岀幆澧冧腑閰嶇疆锛?

-   `JWT_SECRET`锛欽WT 绛惧悕瀵嗛挜锛屽繀椤婚厤缃紝绂佹纭紪鐮併€?- `PG_HOST`锛歅ostgreSQL 鍦板潃銆?- `PG_PORT`锛歅ostgreSQL 绔彛銆?- `PG_USER`锛歅ostgreSQL 鐢ㄦ埛鍚嶃€?- `PG_PASSWORD`锛歅ostgreSQL 瀵嗙爜銆?- `PG_DATABASE`锛歅ostgreSQL 鏁版嵁搴撳悕銆?- `SERVER_PORT`锛氬悗绔惎鍔ㄧ鍙ｏ紙鍙€夛紝榛樿 `8082`锛夈€?- `DIFY_API_KEY`锛欴ify API Key锛圓I 浠ｇ悊蹇呴』锛夈€?- `DIFY_API_BASE_URL`锛欴ify API 鍩虹鍦板潃锛堝彲閫夛紝榛樿 `https://api.dify.ai`锛夈€?

## 鍓嶇寤鸿鐜鍙橀噺

鍦?`apps/frontend/web` 鎵€鍦ㄨ繍琛岀幆澧冧腑閰嶇疆锛?

-   `VITE_WS_PROTOCOL`锛歚ws` 鎴?`wss`銆?- `VITE_WS_HOST`锛歐ebSocket 鏈嶅姟鍦板潃銆?- `VITE_WS_PORT`锛歐ebSocket 鏈嶅姟绔彛銆?

## 鏁版嵁搴撹縼绉?宸插叧闂?TypeORM 鑷姩鍚屾锛坄synchronize: false`锛夛紝浣跨敤 migration 绠＄悊鏁版嵁搴撶粨鏋勩€?

```bash
pnpm --filter @miaoma-doc/server migration:run
```

鍥炴粴涓婁竴鏉¤縼绉伙細

```bash
pnpm --filter @miaoma-doc/server migration:revert
```

鐢熸垚杩佺Щ鑽夌锛?

```bash
pnpm --filter @miaoma-doc/server migration:generate
```
