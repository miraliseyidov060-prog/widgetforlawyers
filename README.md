# Hüquq faktı widget-i

Mərkəz hüquqi faktları admin paneldən yükləyir. İstifadəçilərin iPhone widget-ləri həmin faktları təsadüfi sırada göstərir.

```
Admin paneli (docs/admin.html)
        │  GitHub API ilə yazır
        ▼
docs/facts.json + docs/meta.json   ← GitHub Pages bunları yayımlayır
        ▲
        │  oxuyur (yalnız oxuyur, kod çəkmir)
iPhone widget-i (Scriptable)
```

## Fayllar

| Fayl | Nə üçündür |
|---|---|
| `docs/index.html` | İstifadəçilər üçün quraşdırma səhifəsi və canlı demo |
| `docs/admin.html` | Mərkəz üçün admin paneli |
| `docs/widget.js` | iPhone widget skripti (quraşdırma səhifəsi onu kopyalayır) |
| `docs/facts.json` | Bütün faktlar |
| `docs/meta.json` | Versiya, say və ümumi ayarlar (ad, mövzu, alt qeyd) |

## Bir dəfəlik qurulum

1. GitHub-da **public** repo yaradın (məsələn `huquq-widget`) və bu qovluğun məzmununu ora yükləyin.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main`, folder: `/docs`** seçin və Save edin. Bir-iki dəqiqədən sonra sayt `https://İSTİFADƏÇİ.github.io/REPO/` ünvanında açılır.
3. Admin üçün token yaradın: **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**. *Repository access* üçün yalnız bu repo-nu seçin, *Permissions → Contents* hüququnu **Read and write** edin.
4. `…/admin.html` ünvanını açın, repo adını (`istifadəçi/repo`) və tokeni yazın.

## Gündəlik iş (admin)

- **Yeni fakt** və ya **Toplu əlavə et** ilə faktları siyahıya əlavə edin. Toplu əlavə üç formatı qəbul edir: sətir-sətir mətn (`Kateqoriya | Fakt | Mənbə`), CSV (`fakt;kateqoriya;mənbə`) və JSON.
- Dəyişikliklər əvvəl brauzerdə qalır. **Dərc et** düyməsi onları GitHub-a yazır.
- Dərcdən sonra Pages saytı bir-iki dəqiqəyə yenilənir, widget-lər növbəti yenilənmədə yeni faktı götürür.
- **Ayarlar** bölməsində widget-in adı, rəng mövzusu və alt qeyd bütün istifadəçilər üçün dəyişir.
- Siyahıdakı ilk 16 fakt **nümunədir** (`"sample": true`). Real faktları əlavə edib mənbələri yoxladıqdan sonra “Nümunələri sil” düyməsi ilə təmizləyin.

## İstifadəçi (iPhone)

`…/index.html` səhifəsini açın və 4 addımı izləyin: Scriptable → kodu kopyala → Scriptable-də yapışdır → widget əlavə et.

Widget-in **Parameter** sahəsi:

- `Əmək hüququ` yalnız bu kateqoriyanın faktlarını göstərir.
- `kateqoriya=Əmək hüququ;movzu=ocean` həm kateqoriyanı, həm rəngi seçir. Mövzular: `ink`, `night`, `ocean`, `sunset`, `forest`, `light`.

## Data formatı

`docs/facts.json`:

```json
{
  "schemaVersion": 1,
  "updatedAt": "2026-11-03T08:40:00.000Z",
  "facts": [
    { "id": "n0000001", "text": "…", "category": "Əmək hüququ", "source": "…", "active": true, "createdAt": "…" }
  ]
}
```

`docs/meta.json` kiçik faylıdır. Widget əvvəlcə onu yoxlayır, `version` dəyişibsə `facts.json`-u yenidən yükləyir. Beləliklə minlərlə fakt olsa da, hər yenilənmədə böyük fayl çəkilmir.

## Təhlükəsizlik və məhdudiyyətlər

- **Faktlar public-dir.** Repo və Pages public olduğuna görə faktları hər kəs oxuya bilər. Məxfi məlumat yükləməyin.
- **Yazmaq yalnız token sahibinə açıqdır.** Admin səhifəsini hər kəs görə bilər, amma tokensiz heç nəyi dəyişə bilməz. Tokeni paylaşmayın, işdən ayrılan əməkdaşın tokenini ləğv edin.
- **Widget yalnız data oxuyur.** Telefonda işləyən kod quraşdırma anında kopyalanan koddur. Repo-dakı dəyişiklik istifadəçilərin telefonundakı kodu dəyişdirmir. Kodu yeniləmək lazım olsa, istifadəçilər quraşdırma səhifəsindən yenidən kopyalayır.
- **iOS yeniləmə vaxtını özü seçir.** Widget-in hər ekran açılışında yenilənməsinə icazə yoxdur. Skript hər yenilənmədə yeni fakt seçir və təxminən 5 dəqiqədən bir yenilənmək istəyir. iOS bunu bəzən gecikdirir.
- **Hüquqi məsləhət deyil.** Faktlar ümumi məlumat üçündür. Mənbələri yoxlanmış faktlar yükləyin.

## Növbəti mərhələ

Çoxlu istifadəçi, statistika (neçə nəfər nəyi görüb) və rəsmi paylama lazım olarsa, eyni data formatı üzərində real iOS tətbiqi (WidgetKit + TestFlight/App Store) qurmaq olar. Bunun üçün Mac, Xcode və Apple Developer hesabı lazımdır.
