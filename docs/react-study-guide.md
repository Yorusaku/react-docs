# React 瀛︿範鏂囨。

> 褰撳墠杩涘害锛氶樁娈典竴
> 宸茶鐩栵細瀛︿範鎬昏銆丏escribing the UI銆丄dding Interactivity 鍩虹
> 鍚庣画浼氱户缁湪杩欎釜鏂囦欢閲岃拷鍔?Managing State銆丒scape Hatches銆侀」鐩槧灏勩€侀潰璇曡〃杈俱€佹簮鐮佸績鏅?
## 瀛︿範鎬昏

### 杩欎唤鏂囨。鐨勫畾浣?
杩欎笉鏄竴浠藉彧璁?API 鐨?React 鏁欑▼锛屼篃涓嶆槸涓€浠藉彧鑳屽叓鑲＄殑闈㈢粡锛岃€屾槸涓€浠介€傚悎浣犲綋鍓嶉樁娈电殑 React 瀛︿範鏂囨。锛?
- 浠?React 瀹樻柟 Learn 涓荤嚎涓洪鏋?- 鍚屾椂鐓ч【 Vue -> React 杩佺Щ鐞嗚В
- 鍚屾椂鏄犲皠浣犵殑鍗忓悓鏂囨。椤圭洰鍦烘櫙
- 鍚屾椂琛ラ綈闈㈣瘯琛ㄨ揪鍜屽繀瑕佺殑搴曞眰蹇冩櫤

浣犵幇鍦ㄦ渶閲嶈鐨勪笉鏄€滄妸 React API 鍏ㄨ儗涓嬫潵鈥濓紝鑰屾槸鍏堟妸 React 鐨勪富绾垮績鏅虹珛浣忥細

- React 鍦ㄦ弿杩颁粈涔?- React 鎬庝箞鍝嶅簲浜や簰
- React 鎬庝箞璁捐鐘舵€?- React 浠€涔堟椂鍊欓渶瑕侀€冪敓鑸辫兘鍔?
---

### 浣犺鍏堝缓绔嬬殑 4 涓€诲績鏅?
#### 蹇冩櫤涓€锛歊eact 涓昏鍦ㄨВ鍐斥€滅姸鎬佸彉鍖栧悗锛孶I 濡備綍绋冲畾鏇存柊鈥?
Vue 寮€鍙戣€呯涓€娆″ React锛屾渶瀹规槗鎶婃敞鎰忓姏鏀惧湪 JSX銆丠ook 璇硶銆佷簨浠跺啓娉曡繖浜涜〃闈㈠樊寮備笂銆?
浣?React 鐪熸鐨勬牳蹇冧笉鏄繖浜涳紝鑰屾槸杩欎竴鍙ワ細

`UI = f(state)`

鎰忔€濇槸锛?
- 鍏堟湁鐘舵€?- 鍐嶆牴鎹姸鎬佽绠楀綋鍓?UI 搴旇闀夸粈涔堟牱
- 鐘舵€佸彉鍖栧悗锛孯eact 閲嶆柊璁＄畻 UI锛屽啀鍐冲畾鏈€灏忓寲鏇存柊 DOM

#### 蹇冩櫤浜岋細Vue 鏇村儚鈥滃搷搴斿紡渚濊禆杩借釜鈥濓紝React 鏇村儚鈥滅粍浠跺嚱鏁伴噸鏂版墽琛屸€?
浣犲彲浠ュ厛杩欐牱鐞嗚В锛?
- Vue锛氭敼浜嗗搷搴斿紡鏁版嵁锛岃皝渚濊禆瀹冿紝璋佹洿鏂?- React锛氱姸鎬佸彉浜嗭紝缁勪欢鍑芥暟閲嶆柊鎵ц锛岄噸鏂板緱鍒颁竴浠芥柊鐨?UI 鎻忚堪

杩欎袱涓柟鍚戦兘灞炰簬澹版槑寮?UI锛屼絾 React 鐨勮繍琛屽績鏅烘洿鎺ヨ繎锛?
- 缁勪欢鏄嚱鏁?- 姣忔娓叉煋閮芥槸涓€娆￠噸鏂拌绠?- state 鏄繖娆℃覆鏌撴嬁鍒扮殑蹇収

#### 蹇冩櫤涓夛細涓嶆槸鎵€鏈夌姸鎬侀兘璇ヤ氦缁?React 鑷繁绠?
鍦ㄤ綘鐨勯」鐩噷锛岃嚦灏戞湁 4 绫荤姸鎬侊細

- URL 鐘舵€侊細褰撳墠椤甸潰銆佸綋鍓嶆枃妗?id銆佺瓫閫夋潯浠舵槸鍚︽斁杩涙煡璇㈠弬鏁?- 鏈湴 UI 鐘舵€侊細寮圭獥寮€鍏炽€乭over銆乼ab銆佽緭鍏ユ鍐呭銆佷晶杈规爮灞曞紑鐘舵€?- 鏈嶅姟绔姸鎬侊細鐢ㄦ埛淇℃伅銆佹枃妗ｅ垪琛ㄣ€佹枃妗ｈ鎯呫€佸浘璋辨暟鎹?- 缂栬緫鍣?鍗忓悓鐘舵€侊細Tiptap/ProseMirror 鍐呴儴鏂囨。妯″瀷銆乊js 鍗忓悓鐘舵€併€乤wareness銆乻election

鍚庨潰浣犱細瓒婃潵瓒婃竻妤氾細

- React 鏈湴 state 涓嶈礋璐ｄ竴鍒?- React Query 璐熻矗鏈嶅姟绔姸鎬?- 缂栬緫鍣ㄥ唴鏍稿拰 Yjs 璐熻矗鑷繁鐨勯偅濂楃姸鎬佺郴缁?
#### 蹇冩櫤鍥涳細React 瀛︿範涓嶈鍙仠鍦ㄢ€滀細鍐欌€濓紝鑰岃鍋氬埌鈥滀細璁测€?
浣犺繖娆″ React 鐨勭洰鏍囨槸涓夊眰锛?
- 浼氱敤锛氳兘鍦ㄩ」鐩噷绋冲畾鍐欏嚭缁勪欢銆佺姸鎬併€丒ffect
- 浼氳锛氳兘鎶?React 璁捐鎬濊矾璁叉竻妤?- 浼氭槧灏勶細鑳芥妸 React 蹇冩櫤鏄犲皠鍒板崗鍚屾枃妗ｇ郴缁熼噷

鎵€浠ヨ繖浠芥枃妗ｇ殑鍐欐硶涔熶細涓€鐩村洿缁曡繖涓夊眰鏉ョ粍缁囥€?
---

## Describing the UI

### React 鍦ㄨВ鍐充粈涔堥棶棰?
#### 杩欎竴鑺傚湪瑙ｅ喅浠€涔堥棶棰?
涓轰粈涔堝墠绔凡缁忚兘鍐欓〉闈簡锛岃繕闇€瑕?React锛烺eact 鍒板簳鎻愪緵浜嗕粈涔堜环鍊硷紵

#### React 瀹樻柟涓荤嚎

`Describing the UI`

#### 鏍稿績缁撹

1. React 涓昏瑙ｅ喅鐨勬槸鈥滄暟鎹彉鍖栧悗锛岀晫闈㈠浣曠ǔ瀹氥€佸彲缁存姢鍦版洿鏂扳€濄€?2. React 鐨勬€濊矾涓嶆槸鈥滄墜鍔ㄦ搷浣?DOM 鏀硅繖閲屻€佹敼閭ｉ噷鈥濓紝鑰屾槸鈥滃厛鎻忚堪褰撳墠鐘舵€佷笅 UI 搴旇鏄粈涔堬紝鍐嶈 React 鍘绘洿鏂扮晫闈⑩€濄€?3. React 鎶婇〉闈㈡媶鎴愮粍浠讹紝缁勪欢鏄?UI 鐨勬渶灏忕粍鍚堝崟鍏冦€?4. React 闈炲父寮鸿皟鍗曞悜鏁版嵁娴佸拰澹版槑寮?UI銆?
#### Vue 瀵圭収鐞嗚В

Vue 閲屼綘缁忓父浼氫粠妯℃澘鍜屽搷搴斿紡寮€濮嬬悊瑙ｉ〉闈紱React 閲屾洿鎺ㄨ崘浣犱粠鈥滅粍浠跺嚱鏁?+ state + 閲嶆柊娓叉煋鈥濆紑濮嬬悊瑙ｉ〉闈€?
#### 鏀惧埌浣犵殑椤圭洰閲屾€庝箞鐞嗚В

浣犵殑鏂囨。绯荤粺閲岋細

- 鏂囨。鍒楄〃鏄煇浠芥暟鎹殑 UI 缁撴灉
- 褰撳墠鏂囨。椤垫槸鏌愪釜璺敱鍙傛暟鍜屾帴鍙ｆ暟鎹殑 UI 缁撴灉
- 宸ュ叿鏍忔樉绀虹姸鎬佹槸缂栬緫鍣ㄩ€夊尯鍜屾湰鍦扮姸鎬佺殑 UI 缁撴灉

杩欎簺閮藉彲浠ョ敤涓€鍙ヨ瘽姒傛嫭锛?
鈥滅晫闈笉鏄墜鍔ㄦ嫾鍑烘潵鐨勶紝鑰屾槸鐘舵€佺畻鍑烘潵鐨勩€傗€?
#### 闈㈣瘯鎬庝箞璇?
React 鏈川涓婃槸涓€涓０鏄庡紡 UI 搴撱€傚紑鍙戣€呬富瑕佹弿杩扳€滃綋鍓嶇姸鎬佷笅鐣岄潰搴旇鏄粈涔堚€濓紝React 鍐嶈礋璐ｆ妸鐘舵€佸彉鍖栨槧灏勬垚鐣岄潰鏇存柊銆傝繖鏍峰彲浠ユ妸澶嶆潅浜や簰鎷嗘垚缁勪欢鍜岀姸鎬佷袱涓淮搴︽潵绠＄悊銆?
#### 閫熻

React 涓嶆槸鈥滃彟涓€濂楁ā鏉胯娉曗€濓紝鑰屾槸鈥滅敤鐘舵€侀┍鍔?UI 鐨勬柟寮忕粍缁囧墠绔€濄€?
---

### JSX銆佺粍浠躲€乸rops銆乧hildren

#### 杩欎竴鑺傚湪瑙ｅ喅浠€涔堥棶棰?
React 閲岀殑 UI 鍒板簳鎬庝箞鍐欙紝鐖剁粍浠跺拰瀛愮粍浠朵箣闂存€庝箞浼犻€掍俊鎭€?
#### React 瀹樻柟涓荤嚎

`Your First Component`銆乣Writing Markup with JSX`銆乣Passing Props to a Component`

#### 鏍稿績缁撹

1. 缁勪欢灏辨槸杩斿洖 JSX 鐨勫嚱鏁般€?2. JSX 涓嶆槸瀛楃涓叉ā鏉匡紝鏈川涓婁細琚紪璇戞垚 React Element銆?3. `props` 鏄埗缁勪欢浼犵粰瀛愮粍浠剁殑杈撳叆銆?4. `children` 鏈川涓婁篃鏄竴涓壒娈婄殑 prop锛岀敤鏉ヨ〃绀虹粍浠舵爣绛句腑闂村祵濂楃殑鍐呭銆?
#### 鏈€灏忎唬鐮佺ず渚?
```tsx
type DocCardProps = {
  title: string
  author: string
  children: React.ReactNode
}

function DocCard({ title, author, children }: DocCardProps) {
  return (
    <section className="doc-card">
      {/* 缁勪欢鏍规嵁 props 娓叉煋涓嶅悓鍐呭 */}
      <header>
        <h2>{title}</h2>
        <span>浣滆€咃細{author}</span>
      </header>

      {/* children 灏辨槸鐖剁粍浠跺す鍦ㄦ爣绛鹃噷鐨勫唴瀹?*/}
      <div className="doc-card__content">{children}</div>
    </section>
  )
}

export default function App() {
  const currentUser = '寮犱笁'

  return (
    <DocCard title="React 瀛︿範绗旇" author={currentUser}>
      {/* 杩欐 JSX 浼氫綔涓?children 浼犺繘鍘?*/}
      <p>杩欎竴娈靛唴瀹逛笉鏄啓姝诲湪缁勪欢閲岀殑锛岃€屾槸鐖剁粍浠朵紶鍏ョ殑銆?/p>
    </DocCard>
  )
}
```

#### 浠ｇ爜娉ㄩ噴鐗堣В閲?
1. `DocCard` 鏄粍浠讹紝鏈川鏄竴涓嚱鏁般€?2. `title`銆乣author`銆乣children` 閮芥槸鐖剁粍浠剁粰瀹冪殑杈撳叆銆?3. JSX 閲岀敤 `{}` 宓屽叆 JavaScript 琛ㄨ揪寮忋€?4. `children` 闈炲父閫傚悎鍋氬鍣ㄧ被缁勪欢銆?
#### Vue 瀵圭収鐞嗚В

- `props` 鍜?Vue 閲岀殑 props 寰堝儚
- `children` 鍙互鍏堢被姣旀垚榛樿鎻掓Ы
- JSX 鍙互鍏堢悊瑙ｆ垚鈥滄妸 template 鍐欒繘 JavaScript鈥?
#### 鏀惧埌浣犵殑椤圭洰閲屾€庝箞鐞嗚В

浣犵殑 `Layout`銆乣Card`銆乣Toolbar`銆乣Popover`銆乣Aside` 杩欑被缁勪欢锛屽ぉ鐒跺氨寰堥€傚悎璧扳€滃３瀛愮粍浠?+ children鈥濈殑缁勫悎妯″紡銆?
#### 闈㈣瘯鎬庝箞璇?
JSX 鏄?React 鎻忚堪 UI 鐨勮娉曟墿灞曪紝鏈€缁堜細缂栬瘧鎴?React Element銆傜粍浠堕€氳繃 props 鎺ユ敹杈撳叆锛岄€氳繃杩斿洖 JSX 鎻忚堪鐣岄潰銆俙children` 璁?React 缁勫悎鑳藉姏闈炲父寮恒€?
#### 閫熻

缁勪欢鏄嚱鏁帮紝JSX 鏄?UI 鎻忚堪锛宲rops 鏄緭鍏ワ紝children 鏄祵濂楀唴瀹广€?
---

### 鏉′欢娓叉煋銆佸垪琛ㄦ覆鏌撱€乲ey

#### 杩欎竴鑺傚湪瑙ｅ喅浠€涔堥棶棰?
涓嶅悓鐘舵€佷笅鏄剧ず涓嶅悓鍐呭锛屼互鍙婂浣曠ǔ瀹氭覆鏌撲竴缁勬暟鎹€?
#### React 瀹樻柟涓荤嚎

`Conditional Rendering`銆乣Rendering Lists`

#### 鏍稿績缁撹

1. React 涓嶆彁渚?`v-if`銆乣v-for` 杩欑妯℃澘鎸囦护锛岃€屾槸鐩存帴鐢?JavaScript 鐨勬潯浠跺拰寰幆鑳藉姏銆?2. 鏉′欢娓叉煋甯歌鍐欐硶鏄?`if`銆佷笁鍏冭〃杈惧紡銆乣&&`銆佽繑鍥?`null`銆?3. 鍒楄〃娓叉煋閫氬父浣跨敤 `map`銆?4. `key` 鐨勬湰璐ㄤ笉鏄€滄秷闄よ鍛娾€濓紝鑰屾槸缁?React 涓€涓ǔ瀹氳韩浠姐€?
#### 鏈€灏忎唬鐮佺ず渚?
```tsx
type Page = {
  id: string
  title: string
  isPinned: boolean
}

function PageList({ pages }: { pages: Page[] }) {
  if (pages.length === 0) {
    return <p>鏆傛棤鏂囨。</p>
  }

  return (
    <ul>
      {pages.map((page) => (
        // key 瑕佺敤绋冲畾 id锛岃€屼笉鏄暟缁勪笅鏍?        <li key={page.id}>
          <span>{page.title}</span>
          {page.isPinned ? <strong>锛堢疆椤讹級</strong> : null}
        </li>
      ))}
    </ul>
  )
}
```

#### 浠ｇ爜娉ㄩ噴鐗堣В閲?
1. React 閲屸€滄覆鏌撲粈涔堚€濇湰璐ㄤ笂灏辨槸鈥滃綋鍓嶈繖娆″嚱鏁版墽琛岃繑鍥炰粈涔?JSX鈥濄€?2. 鍒楄〃娓叉煋鏃讹紝`key` 瑕佹斁鍦ㄥ綋鍓嶈閬嶅巻鍑烘潵鐨勮繖涓€灞傚厓绱犱笂銆?3. `key` 鏈€濂芥潵鑷笟鍔″敮涓€ id锛岃€屼笉鏄复鏃跺€兼垨鏁扮粍 index銆?
#### Vue 瀵圭収鐞嗚В

Vue 閲屼綘浼氬啓 `v-if`銆乣v-for`銆乣:key`锛汻eact 閲屽啓娉曚笉鍚岋紝浣嗘湰璐ㄤ笂閮芥槸鍦ㄦ牴鎹姸鎬佺敓鎴?UI锛屽苟鍛婅瘔妗嗘灦鑺傜偣韬唤銆?
#### 鏀惧埌浣犵殑椤圭洰閲屾€庝箞鐞嗚В

鏂囨。鍒楄〃銆佸崗鍚屾垚鍛樺垪琛ㄣ€佸潡鑺傜偣鍒楄〃銆丼lash 鑿滃崟銆佸浘璋辫妭鐐瑰垪琛紝閮戒細澶ч噺渚濊禆鍒楄〃娓叉煋鍜岀ǔ瀹氱殑 `key`銆?
#### 闈㈣瘯鎬庝箞璇?
React 鍒楄〃娓叉煋渚濊禆 `map`锛宍key` 鐢ㄦ潵鏍囪瘑鍚屽眰绾ц妭鐐硅韩浠姐€傚畠浼氱洿鎺ュ奖鍝嶈妭鐐瑰鐢ㄣ€佺Щ鍔ㄣ€侀攢姣侊紝浠ュ強缁勪欢鍐呴儴 state 鏄惁浼氫覆浣嶃€?
#### 缁х画杩介棶鏃舵€庝箞鎺?
濡傛灉闈㈣瘯瀹橀棶鈥滀负浠€涔堜笉瑕佽交鏄撶敤 index 鍋?key鈥濓紝浣犲彲浠ョ洿鎺ョ瓟锛?
褰撳垪琛ㄥ彂鐢熸彃鍏ャ€佸垹闄ゃ€佹帓搴忔椂锛宨ndex 浼氬彉鍖栵紝React 鍙兘鎶婃棫鑺傜偣鐨勭姸鎬侀敊璇鐢ㄥ埌鏂颁綅缃紝瀵艰嚧杈撳叆妗嗕覆鍊笺€侀€変腑鐘舵€侀敊浣嶃€佸姩鐢诲紓甯哥瓑闂銆?
#### 閫熻

React 鐢?JavaScript 鍐欐潯浠跺拰鍒楄〃锛沗key` 鏄妭鐐硅韩浠斤紝涓嶆槸瑁呴グ璇硶銆?
---

### 淇濇寔缁勪欢绾补

#### 杩欎竴鑺傚湪瑙ｅ喅浠€涔堥棶棰?
涓轰粈涔?React 涓€鐩村己璋冣€渞ender 闃舵瑕佺函鈥濓紝浠ュ強浠€涔堝彨鈥滅粍浠剁函绮光€濄€?
#### React 瀹樻柟涓荤嚎

`Keeping Components Pure`

#### 鏍稿績缁撹

1. 缁勪欢鍦ㄦ覆鏌撴椂锛屽簲璇ュ彧鏍规嵁杈撳叆璁＄畻杈撳嚭銆?2. 涓嶈鍦?render 杩囩▼涓伔鍋蜂慨鏀瑰閮ㄥ彉閲忋€佸彂璇锋眰銆佹搷浣?DOM銆佸啓璁㈤槄銆?3. 鍚屾牱鐨勮緭鍏ワ紝灏介噺寰楀埌鍚屾牱鐨勮緭鍑猴紝杩欐牱缁勪欢鏇寸ǔ瀹氥€佹洿鍙娴嬨€?
#### 涓€涓弽渚?
```tsx
let guest = 0

function Cup() {
  // 杩欐槸涓嶇函鐨勫啓娉曪細娓叉煋鏃跺伔鍋锋敼浜嗗閮ㄥ彉閲?  guest = guest + 1
  return <h2>绗?{guest} 浣嶅浜?/h2>
}
```

#### Vue 瀵圭収鐞嗚В

杩欏拰 Vue 閲屸€滄ā鏉挎覆鏌撻樁娈典笉瑕佸仛鍓綔鐢ㄢ€濇槸鍚屼竴绫诲師鍒欍€傚彧鏄湪 React 閲岋紝杩欎釜闂鏇村鏄撴毚闇诧紝鍥犱负缁勪欢鍑芥暟浼氬弽澶嶆墽琛屻€?
#### 鏀惧埌浣犵殑椤圭洰閲屾€庝箞鐞嗚В

缂栬緫鍣ㄩ〉闈€佸崗鍚岄〉闈€佹枃妗ｅ浘璋遍〉闈㈤兘浼氶绻侀噸娓叉煋銆傚彧瑕佷綘鎶婂壇浣滅敤鍐欒繘 render锛岄棶棰樹細闈炲父闅愯斀涓旈毦鏌ャ€?
#### 闈㈣瘯鎬庝箞璇?
React 瑕佹眰缁勪欢鍦?render 闃舵淇濇寔绾补锛屽洜涓?render 鐨勮亴璐ｆ槸璁＄畻 UI锛岃€屼笉鏄墽琛屽壇浣滅敤銆傝繖鏍风粍浠舵墠鍏峰鍙娴嬫€э紝涔熸洿閫傚悎 React 鐨勬覆鏌撴ā鍨嬨€?
#### 閫熻

render 鍙礋璐ｇ畻 UI锛屼笉璐熻矗鍋氬壇浣滅敤銆?
---

## Adding Interactivity

### 浜嬩欢澶勭悊

#### 杩欎竴鑺傚湪瑙ｅ喅浠€涔堥棶棰?
鐢ㄦ埛鐐瑰嚮鎸夐挳銆佽緭鍏ユ枃鏈€佹彁浜よ〃鍗曟椂锛孯eact 鏄€庝箞鎺ヤ綇杩欎簺琛屼负鐨勩€?
#### React 瀹樻柟涓荤嚎

`Responding to Events`

#### 鏍稿績缁撹

1. React 浜嬩欢澶勭悊鏈川涓婃槸鈥滄妸鍑芥暟浼犵粰 JSX 灞炴€р€濄€?2. 浼犵殑鏄嚱鏁版湰韬紝涓嶆槸鎵ц缁撴灉銆?3. 浜嬩欢澶勭悊鍑芥暟閲屽彲浠ヨ鍙栧綋鍓嶆覆鏌撶殑 state锛屼篃鍙互閫氳繃 `setState` 鍙戣捣涓嬩竴娆℃覆鏌撱€?
#### 鏈€灏忎唬鐮佺ず渚?
```tsx
import { useState } from 'react'

export default function SaveButton() {
  const [savedCount, setSavedCount] = useState(0)

  function handleSave() {
    // 浜嬩欢閲屾洿鏂扮姸鎬侊紝React 浼氬彂璧蜂笅涓€娆℃覆鏌?    setSavedCount(savedCount + 1)
  }

  return (
    <section>
      <button onClick={handleSave}>淇濆瓨鏂囨。</button>
      <p>宸蹭繚瀛橈細{savedCount} 娆?/p>
    </section>
  )
}
```

#### Vue 瀵圭収鐞嗚В

Vue 閲屼綘甯稿啓 `@click="handleSave"`锛汻eact 閲屽啓鎴?`onClick={handleSave}`銆?
#### 鏀惧埌浣犵殑椤圭洰閲屾€庝箞鐞嗚В

宸ュ叿鏍忔寜閽€佷晶杈规爮鍒囨崲銆佹枃妗ｅ垱寤恒€佸垎浜脊绐楁墦寮€銆佸潡鎿嶄綔鑿滃崟锛岃儗鍚庨兘鏄€滀簨浠?-> 鏇存柊鐘舵€?-> 閲嶆柊娓叉煋鈥濄€?
#### 闈㈣瘯鎬庝箞璇?
React 浜嬩欢澶勭悊灏辨槸鎶婂洖璋冨嚱鏁颁紶缁?JSX 浜嬩欢灞炴€с€備簨浠跺彂鐢熷悗锛屽洖璋冨彲浠ヨ鍙栧綋鍓嶆覆鏌撳揩鐓ч噷鐨?state锛屽苟閫氳繃 `setState` 瑙﹀彂鏂扮殑娓叉煋銆?
#### 閫熻

React 浜嬩欢 = 浼犲嚱鏁帮紝涓嶆槸浼犳墽琛岀粨鏋溿€?
---

### useState

#### 杩欎竴鑺傚湪瑙ｅ喅浠€涔堥棶棰?
缁勪欢鎬庝箞璁颁綇淇℃伅锛屼负浠€涔堟櫘閫氬彉閲忎笉琛屻€?
#### React 瀹樻柟涓荤嚎

`State: A Component's Memory`

#### 鏍稿績缁撹

1. 鏅€氬彉閲忎笉浼氬湪缁勪欢閲嶆柊鎵ц鍚庡府浣犱繚鐣欏€笺€?2. `useState` 缁欑粍浠舵彁渚涗簡涓€浠借法娓叉煋淇濈暀鐨勬湰鍦拌蹇嗐€?3. `setState` 鐨勬剰涔変笉鏄€滅珛鍒讳慨鏀瑰綋鍓嶅彉閲忊€濓紝鑰屾槸鈥滆姹備笅涓€娆℃覆鏌撲娇鐢ㄦ柊鍊尖€濄€?
#### Vue 瀵圭収鐞嗚В

Vue 閲屼綘鏇村鏄撴妸鐘舵€佺悊瑙ｆ垚涓€涓€滃搷搴斿紡瀹瑰櫒鈥濓紱React 閲屼綘瑕佹洿涔犳儻鈥渟tate 鏄綋鍓嶆覆鏌撴嬁鍒扮殑缁撴灉鈥濄€?
#### 鏀惧埌浣犵殑椤圭洰閲屾€庝箞鐞嗚В

杈撳叆妗嗗唴瀹广€佸脊绐楀紑鍏炽€乼ab 鍒囨崲銆乭over 鐘舵€併€佸眬閮?loading锛岄兘閫傚悎浠?`useState` 寮€濮嬨€?
#### 闈㈣瘯鎬庝箞璇?
`useState` 鐢ㄦ潵淇濆瓨缁勪欢鐨勬湰鍦扮姸鎬併€傚畠鐨勬牳蹇冧环鍊兼槸璁╃粍浠跺湪澶氭娓叉煋涔嬮棿淇濈暀鏁版嵁锛屽苟椹卞姩 UI 鏇存柊銆?
#### 閫熻

鏅€氬彉閲忎細涓紝state 浼氫繚鐣欍€?
---

### State as a Snapshot

#### 杩欎竴鑺傚湪瑙ｅ喅浠€涔堥棶棰?
涓轰粈涔?`setState` 涔嬪悗绔嬪埢鎵撳嵃锛岃繕鏄棫鍊硷紱涓轰粈涔?React 鐘舵€佹€昏鍒濆鑰呰寰椻€滄參鍗婃媿鈥濄€?
#### React 瀹樻柟涓荤嚎

`State as a Snapshot`

#### 鏍稿績缁撹

1. 姣忎竴娆℃覆鏌撴嬁鍒扮殑 state锛岄兘鍍忎竴寮犲揩鐓с€?2. 浜嬩欢澶勭悊鍑芥暟璇诲埌鐨勬槸鈥滃垱寤哄畠閭ｆ娓叉煋瀵瑰簲鐨?state鈥濓紝涓嶆槸鏈潵鍊笺€?3. `setState` 涓嶄細鍚屾淇敼褰撳墠闂寘閲岀殑 state 鍙橀噺銆?
#### 鏈€灏忎唬鐮佺ず渚?
```tsx
import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  function handleAddOne() {
    setCount(count + 1)

    // 杩欓噷鎵撳嵃鐨勪粛鐒舵槸褰撳墠杩欐娓叉煋閲岀殑鏃у€?    console.log('褰撳墠浜嬩欢閲岃鍒扮殑 count锛?, count)
  }

  function handleAddThreeWrong() {
    // 杩欎笁娆￠兘鍩轰簬鍚屼竴涓棫蹇収 count
    setCount(count + 1)
    setCount(count + 1)
    setCount(count + 1)
  }

  function handleAddThreeRight() {
    // 鍑芥暟寮忔洿鏂颁細鍩轰簬涓婁竴娆＄粨鏋滅户缁绠?    setCount((prev) => prev + 1)
    setCount((prev) => prev + 1)
    setCount((prev) => prev + 1)
  }

  return (
    <section>
      <p>褰撳墠璁℃暟锛歿count}</p>
      <button onClick={handleAddOne}>+1</button>
      <button onClick={handleAddThreeWrong}>閿欒鍦?+3</button>
      <button onClick={handleAddThreeRight}>姝ｇ‘鍦?+3</button>
    </section>
  )
}
```

#### 浠ｇ爜娉ㄩ噴鐗堣В閲?
1. `count` 鏄綋鍓嶈繖娆℃覆鏌撴嬁鍒扮殑蹇収锛屼笉鏄竴涓細鑷姩鍙樼殑鍙彉鍙橀噺銆?2. `setCount` 涓嶆槸鍚屾璧嬪€硷紝鑰屾槸鎻愪氦鏇存柊璇锋眰銆?3. 渚濊禆鏃у€兼椂锛屽簲璇ヤ紭鍏堢敤鍑芥暟寮忔洿鏂般€?
#### Vue 瀵圭収鐞嗚В

Vue 寮€鍙戣€呮渶瀹规槗韪╃殑鍧戯紝灏辨槸鎶?React state 褰撴垚鍙互鈥滅洿鎺ュ師鍦板彉鍖栤€濈殑鍝嶅簲寮忔暟鎹€俁eact 涓嶆槸杩欎釜蹇冩櫤銆?
#### 鏀惧埌浣犵殑椤圭洰閲屾€庝箞鐞嗚В

淇濆瓨鎸夐挳鐐瑰嚮娆℃暟銆佸紓姝ヤ笂浼犺鏁般€佸崗鍚岃繛鎺ラ噸璇曘€佸伐鍏锋爮鐘舵€佸垏鎹紝閮藉緢瀹规槗韪╁埌 snapshot 鍜岄棴鍖呮棫鍊肩殑鍧戙€?
#### 闈㈣瘯鎬庝箞璇?
React 涓?state 鍏锋湁蹇収鐗规€с€備竴娆℃覆鏌撳垱寤哄嚭鏉ョ殑浜嬩欢澶勭悊鍑芥暟锛岃鍙栧埌鐨勬槸褰撴椂閭ｆ娓叉煋鐨勭姸鎬佸€硷紝鎵€浠?`setState` 涓嶄細鍚屾鏀规帀褰撳墠闂寘涓殑 state銆?
#### 閫熻

state 涓嶆槸娲诲彉閲忥紝鑰屾槸褰撳墠娓叉煋鐨勪竴寮犲揩鐓с€?
---

### Render and Commit

#### 杩欎竴鑺傚湪瑙ｅ喅浠€涔堥棶棰?
涓轰粈涔堢粍浠跺嚱鏁版€诲湪閲嶆柊鎵ц锛屼互鍙娾€滅粍浠舵墽琛屼簡鈥濆拰鈥淒OM 鏇存柊浜嗏€濅负浠€涔堜笉鏄竴鍥炰簨銆?
#### React 瀹樻柟涓荤嚎

`Render and Commit`

#### 鏍稿績缁撹

1. React 鏇存柊 UI 澶ц嚧鍒嗕笁姝ワ細瑙﹀彂娓叉煋銆佹覆鏌撶粍浠躲€佹彁浜ゅ埌 DOM銆?2. 娓叉煋缁勪欢涓昏鏄噸鏂版墽琛岀粍浠跺嚱鏁帮紝寰楀埌鏂扮殑 UI 鎻忚堪銆?3. 鎻愪氦鍒?DOM 鎵嶆槸鐪熸鍙戠敓鐣岄潰鏇存柊鐨勯樁娈点€?4. 缁勪欢閲嶆柊鎵ц涓嶇瓑浜庢暣涓?DOM 鏍戣閲嶅缓銆?
#### Vue 瀵圭収鐞嗚В

Vue 寮€鍙戣€呭父瑙佺枒闂槸锛氣€滄€庝箞鏁翠釜鍑芥暟鍙堣窇浜嗕竴閬嶏紵鈥? 
杩欐槸 React 鐨勬甯稿伐浣滄柟寮忋€傚嚱鏁伴噸鏂拌窇锛屾槸涓轰簡閲嶆柊璁＄畻 UI锛涙渶缁?DOM 鏄惁鍙樺寲锛岃繕瑕佺湅鎻愪氦闃舵銆?
#### 鏀惧埌浣犵殑椤圭洰閲屾€庝箞鐞嗚В

缂栬緫鍣ㄥ澹炽€佹枃妗ｅ垪琛ㄩ〉銆佸浘璋遍〉銆佸彸渚ч潰鏉块兘浼氱粡甯稿彂鐢熺粍浠堕噸鏂版墽琛岋紝浣嗚繖涓嶇瓑浜?React 姣忔閮芥妸鐪熷疄 DOM 鍏ㄩ噺閲嶅缓銆?
#### 闈㈣瘯鎬庝箞璇?
React 鐨勬洿鏂版祦绋嬪彲浠ユ鎷负 Render 鍜?Commit銆俁ender 闃舵閲嶆柊璁＄畻鏂扮殑 UI 鎻忚堪锛孋ommit 闃舵鍐嶆妸蹇呰鐨勫樊寮傛彁浜ゅ埌 DOM銆傜粍浠堕噸鏂版墽琛屼笉绛変簬鐪熷疄 DOM 鍏ㄩ噺閲嶅缓銆?
#### 閫熻

Render 鏄畻 UI锛孋ommit 鎵嶆槸鏀?DOM銆?
---

### 鎵归噺鏇存柊涓庡嚱鏁板紡鏇存柊

#### 杩欎竴鑺傚湪瑙ｅ喅浠€涔堥棶棰?
涓轰粈涔堣繛缁娆?`setState` 鐪嬭捣鏉ヤ笉鍍忊€滆皟鐢ㄥ嚑娆″氨鏇存柊鍑犳鈥濄€?
#### React 瀹樻柟涓荤嚎

`Queueing a Series of State Updates`

#### 鏍稿績缁撹

1. React 浼氬鍚屼竴浜嬩欢涓殑鐘舵€佹洿鏂拌繘琛屾壒澶勭悊銆?2. 濡傛灉鏂扮姸鎬佷緷璧栨棫鐘舵€侊紝浼樺厛浣跨敤鍑芥暟寮忔洿鏂般€?3. `setState(value)` 鏇撮€傚悎鐩存帴璧嬫柊鍊硷紱`setState(prev => next)` 鏇撮€傚悎鍩轰簬鏃у€艰绠椼€?
#### 鏀惧埌浣犵殑椤圭洰閲屾€庝箞鐞嗚В

寮傛淇濆瓨銆佷笂浼犳枃浠躲€佹垚鍛橀個璇枫€佸苟鍙戣姹備腑鐨勮鏁板櫒鍜?loading 鐘舵€侊紝缁忓父浼氱敤鍒板嚱鏁板紡鏇存柊銆?
#### 闈㈣瘯鎬庝箞璇?
React 涓悓涓€杞簨浠跺唴鐨勫涓姸鎬佹洿鏂伴€氬父浼氳鎵瑰鐞嗐€傚嚒鏄柊鐘舵€佷緷璧栨棫鐘舵€佹椂锛岄兘搴旇浼樺厛浣跨敤鍑芥暟寮忔洿鏂帮紝閬垮厤鏃у揩鐓ц鐩栭棶棰樸€?
#### 閫熻

渚濊禆鏃у€兼洿鏂帮紝鐢ㄥ嚱鏁板紡鏇存柊銆?
---

### 鏇存柊瀵硅薄涓庢暟缁勭姸鎬?
#### 杩欎竴鑺傚湪瑙ｅ喅浠€涔堥棶棰?
涓轰粈涔?React 閲屼笉鎺ㄨ崘鐩存帴鏀瑰璞″拰鏁扮粍銆?
#### React 瀹樻柟涓荤嚎

`Updating Objects in State`銆乣Updating Arrays in State`

#### 鏍稿績缁撹

1. 鏀捐繘 state 鐨勫璞″拰鏁扮粍锛岃鎸夆€滃彧璇诲€尖€濇潵瀵瑰緟銆?2. 鏇存柊瀵硅薄鏃讹紝杩斿洖鏂板璞°€?3. 鏇存柊鏁扮粍鏃讹紝杩斿洖鏂版暟缁勩€?4. 濡傛灉鐘舵€佸祵濂楀お娣憋紝寰€寰€璇存槑鐘舵€佺粨鏋勯渶瑕佷紭鍖栥€?
#### 鏈€灏忎唬鐮佺ず渚?
```tsx
import { useState } from 'react'

type FilterState = {
  keyword: string
  tags: string[]
}

export default function DocFilterPanel() {
  const [filters, setFilters] = useState<FilterState>({
    keyword: '',
    tags: ['React'],
  })

  function handleKeywordChange(value: string) {
    // 涓嶈兘鐩存帴鏀?filters.keyword
    setFilters({
      ...filters,
      keyword: value,
    })
  }

  function handleAddTag() {
    // 涓嶈兘鐩存帴 push锛岃杩斿洖涓€涓柊鏁扮粍
    setFilters({
      ...filters,
      tags: [...filters.tags, '鍗忓悓'],
    })
  }

  return (
    <section>
      <input
        value={filters.keyword}
        onChange={(e) => handleKeywordChange(e.target.value)}
        placeholder="鎼滅储鏂囨。"
      />
      <button onClick={handleAddTag}>娣诲姞鏍囩</button>
      <pre>{JSON.stringify(filters, null, 2)}</pre>
    </section>
  )
}
```

#### Vue 瀵圭収鐞嗚В

Vue 鐨勫搷搴斿紡绯荤粺鍏佽浣犲啓寰堝鈥滅洿鎺ユ敼鈥濈殑浠ｇ爜锛汻eact 鏇村己璋冣€滄柊寮曠敤琛ㄨ揪鏂扮姸鎬佲€濄€?
#### 鏀惧埌浣犵殑椤圭洰閲屾€庝箞鐞嗚В

绛涢€夋潯浠躲€佽〃鍗曞€笺€侀€変腑鍧?id 鍒楄〃銆佸伐鍏锋爮閰嶇疆瀵硅薄锛岄兘鏄吀鍨嬬殑瀵硅薄/鏁扮粍鐘舵€佸満鏅€?
#### 闈㈣瘯鎬庝箞璇?
React state 鎺ㄨ崘鎸変笉鍙彉鏁版嵁鐨勬柟寮忔洿鏂般€傚璞″拰鏁扮粍涓嶈鍘熷湴淇敼锛岃€岃杩斿洖鏂板紩鐢紝杩欐牱鏇存柊璺緞鏇存竻鏅帮紝涔熸洿鍒╀簬 React 姝ｇ‘璇嗗埆鍙樺寲銆?
#### 閫熻

瀵硅薄鐢ㄦ柊瀵硅薄锛屾暟缁勭敤鏂版暟缁勩€?
---

## 闃舵涓€閫熻

- React 鐨勬牳蹇冧笉鏄娉曪紝鑰屾槸鐘舵€侀┍鍔?UI銆?- JSX 鏄?UI 鎻忚堪锛屼笉鏄ā鏉垮瓧绗︿覆銆?- 缁勪欢鏄嚱鏁帮紝props 鏄緭鍏ワ紝children 鏄壒娈婅緭鍏ャ€?- React 鐢?JavaScript 鍐欐潯浠跺拰鍒楄〃銆?- `key` 鏄妭鐐硅韩浠斤紝涓嶆槸瑁呴グ璇硶銆?- `useState` 鏄粍浠惰蹇嗭紝state 鏄綋鍓嶆覆鏌撳揩鐓с€?- `setState` 涓嶆槸鍚屾璧嬪€笺€?- 渚濊禆鏃у€兼洿鏂版椂锛岀敤鍑芥暟寮忔洿鏂般€?- Render 鏄畻 UI锛孋ommit 鎵嶆槸鏀?DOM銆?- 瀵硅薄鍜屾暟缁勭姸鎬佽鎸変笉鍙彉鏂瑰紡鏇存柊銆?
## 涓嬩竴闃舵棰勫憡

涓嬩竴闃舵浼氱户缁拷鍔犲埌鍚屼竴涓枃浠堕噷锛屽唴瀹瑰寘鎷細

- Managing State锛氬浣曡璁?state銆侀伩鍏嶅啑浣?state銆佺姸鎬佹彁鍗囥€佸彈鎺т笌闈炲彈鎺с€乻tate 淇濈暀涓庨噸缃€乽seReducer銆丆ontext
- Escape Hatches锛歳ef銆丏OM 鎿嶄綔銆乽seEffect銆佷粈涔堟椂鍊欎笉闇€瑕?Effect銆丒ffect 渚濊禆銆佽嚜瀹氫箟 Hook
- 椤圭洰瀹炴垬鏄犲皠锛歊eact Router銆丷eact Query銆乀iptap銆丳roseMirror銆乊js銆丮onorepo
- 闈㈣瘯琛ㄨ揪涓庢簮鐮佸績鏅?
