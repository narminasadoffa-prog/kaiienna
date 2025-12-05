# GitHub-a Push Etmək Üçün Təlimatlar

## Git Quraşdırılması

1. Git-i quraşdırın: https://git-scm.com/download/win
2. Quraşdırmadan sonra terminali yenidən açın

## Push Addımları

Terminaldə bu əmrləri yerinə yetirin:

```bash
# 1. Git repository-ni initialize edin
git init

# 2. Remote repository əlavə edin
git remote add origin https://github.com/narminasadoffa-prog/kaiiena.git

# 3. Bütün faylları add edin
git add .

# 4. Commit edin
git commit -m "Initial commit - Kaiienna e-commerce project"

# 5. Main branch-ə push edin
git branch -M main
git push -u origin main
```

## Əgər Repository Artıq Varsa

```bash
git add .
git commit -m "Update: Blog functionality and fixes"
git push origin main
```

## GitHub Desktop İstifadə Edərək

1. GitHub Desktop quraşdırın: https://desktop.github.com/
2. "File" > "Add Local Repository" seçin
3. Proyekt qovluğunu seçin
4. "Publish repository" düyməsini basın

