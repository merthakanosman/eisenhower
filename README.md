# Eisenhower Cloud Todo

Eisenhower Cloud Todo, gorevleri hareketli bulutlar halinde ekleyip Eisenhower matrisi uzerinde onceliklendirmek icin gelistirilmis bir Next.js uygulamasidir.

## Ozellikler

- Input ile yeni todo ekleme
- Her todo icin ekranda gezen farkli sekilli bulut olusturma
- Bulutlari surukleyerek Eisenhower matrisi kutularina birakma
- `List` butonu ile matrisi manuel acip kapatma
- Matris icindeki gorevleri tamamlandi olarak isaretleme
- Gorev duzenleme ve silme
- Silme onayi
- Matris gorevlerini tasima ikonu ile diger kutulara surukleyerek aktarma

## Teknolojiler

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4

## Kurulum

```bash
npm install
```

## Gelistirme

```bash
npm run dev
```

Tarayicida ac:

```text
http://localhost:3000
```

## Build

```bash
npm run build
```

## Iframe Olarak Kullanma

GitHub Pages acikken uygulama su adresten yayinlanir:

```text
https://merthakanosman.github.io/eisenhower/
```

Baska bir projede su sekilde gom:

```html
<iframe
  src="https://merthakanosman.github.io/eisenhower/embed/"
  title="Eisenhower Cloud Todo"
  style="width: 100%; height: 720px; border: 0;"
  loading="lazy"
></iframe>
```

Bu proje GitHub Pages icin statik export uretir. Build sonrasi `out/index.html` ve `out/embed/index.html` dosyalari olusur.

GitHub repo ayarlarinda `Settings > Pages > Source` degerini `GitHub Actions` yap.

## Lint

```bash
npm run lint
```

## Kullanim

1. Ortadaki inputa gorev yaz.
2. `Ekle` butonuna bas.
3. Olusan bulutu ekranda surukle.
4. Bulutu tutunca acilan 4 matris kutusundan birine birak.
5. `List` butonu ile matris listesini ac.
6. Liste icinde gorevleri tamamla, duzenle, sil veya tasima ikonuyla baska kutuya tasi.

## Matris Alanlari

- Acil ve Onemli
- Onemli, Acil Degil
- Acil, Onemli Degil
- Acil Degil, Onemli Degil
