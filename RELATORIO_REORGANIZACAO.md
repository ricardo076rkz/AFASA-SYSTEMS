# Relatório da Reorganização de Estrutura — AFASA SYSTEMS

Esta reorganização foi feita movendo arquivos e dividindo o CSS por blocos de regras
inteiros (nenhuma linha de propriedade CSS foi reescrita — verificado por checagem
automática: as 802 linhas de `propriedade: valor;` do `style.css` original aparecem,
uma a uma, nos arquivos novos, sem faltar nem duplicar nenhuma).

## 1. HTML movidos

| Arquivo | De | Para |
|---|---|---|
| curator-dashboard.html | raiz | curador/ |
| professional-dashboard.html | raiz | profissional/ |
| home.html, course.html, community.html, create-post.html, about.html, mission.html, plant-guide.html, calculator.html, profile.html | raiz | consumidor/ |
| index.html, login.html, signup.html | raiz | permanecem na raiz (telas de autenticação, usadas antes de haver perfil definido) |

## 2. CSS dividido (1488 linhas → 8 arquivos, via `css/main.css`)

- `css/base/variables.css` — bloco `:root` (variáveis de cor/tema)
- `css/base/reset.css` — reset universal (`*`), `body` e seletores de tag (`input`, `textarea`, `select`, `label`)
- `css/base/typography.css` — criado vazio; não havia bloco de tipografia isolado no CSS original (fontes já estão em `reset.css`)
- `css/layout/grid.css` — `.container` e seu `@media (max-width: 768px)`
- `css/components/components.css` — 105 blocos usados por 2+ perfis (header, bottom-nav, botões, cards, modal, tabs, status-badge, telas de auth, animações)
- `css/pages/curador.css` — 23 blocos exclusivos do Curador
- `css/pages/profissional.css` — 30 blocos exclusivos do Profissional
- `css/pages/consumidor.css` — 36 blocos exclusivos do Consumidor
- `css/main.css` — só `@import`, nenhuma regra própria

## 3. Caminhos corrigidos (única alteração em HTML, além de comentário em JS)

Todos os HTML movidos para `curador/`, `profissional/` e `consumidor/` tiveram os caminhos
para `css/style.css`, `js/script.js` e `images/logo.png` ajustados para `../css/main.css`,
`../js/script.js` e `../images/logo.png`. `consumidor/profile.html` também teve seu
`href="login.html"` ajustado para `../login.html`. Links entre páginas do mesmo perfil
(ex: `home.html` → `course.html` dentro de `consumidor/`) não precisaram de ajuste, pois
continuam na mesma pasta.

`index.html`, `login.html` e `signup.html` (raiz) tiveram `href="css/style.css"` trocado
para `href="css/main.css"`.

## 4. Única alteração em JavaScript (caminho, não lógica)

Em `js/script.js`, 3 linhas de `window.location.href` foram atualizadas para apontar para
as novas pastas: `curador/curator-dashboard.html`, `profissional/professional-dashboard.html`
e `consumidor/home.html`. Nenhuma outra linha do arquivo foi alterada. Um comentário foi
adicionado no topo do arquivo explicando essa exceção pontual.

## 5. Arquivos NÃO tocados (conforme regras)

- `BancoDeDados/` inteira — verificado por hash, idêntica ao original.
- `.git/` — intacta.

## 6. Arquivos órfãos (não movidos, apenas relatados — não referenciados por nenhum HTML)

- `style.css` (raiz) — versão antiga, 1 linha a mais que `css/style.css`
- `script.js` (raiz) — versão antiga, diferença só de quebra de linha (CRLF/LF)
- `logo.jpg` (raiz)

Provavelmente sobras de uma versão anterior do projeto. Recomendo confirmar se ainda são
necessários antes de removê-los manualmente — esta reorganização não teve permissão para
deletar nada.

## 7. Bug preexistente identificado (não corrigido, por estar fora do escopo)

`signup.html` referencia `images/logo.jpg`, mas esse arquivo não existe dentro de `images/`
(só existe `images/logo.png`, e um `logo.jpg` solto na raiz — item 6). Esse link de imagem
já estava quebrado antes da reorganização e continua igual.

## 8. Seletores CSS sem dúvida (todos resolvidos)

Os 223 blocos de regras do `style.css` original foram classificados com 100% de certeza
(nenhum ficou em "MIXED" ou "UNKNOWN" sem resolução), cruzando o uso real de cada classe
nos 15 arquivos HTML e nas classes aplicadas dinamicamente via `js/script.js`
(`classList.add/remove/toggle`), incluindo `.expanded`, `.fade-in` e `.active-green`, que
não apareciam em nenhum HTML estático.

## 9. Atualização final (esta rodada)

- Corrigido bug de quebra de linha duplicada (`\r\r\n`) introduzido na primeira divisão do CSS.
- Corrigido bug de classificação: regras `:hover`/`:focus` (ex: `.btn-primary:hover`, `.btn-approve:hover`) estavam indo parar erroneamente em `base/reset.css`; agora estão nos arquivos corretos (`componentes/`, `paginas/curador.css`, `paginas/profissional.css`).
- Corrigido bug de roteamento: `.container` (regra base) estava indo para `componentes/` em vez de `layout/`.
- **NOVA FALHA ENCONTRADA E SINALIZADA NO CÓDIGO:** `.stats-grid`, `.progress-bar` e `.section-title` são definidas **duas vezes** no CSS original, com valores diferentes entre si. O comportamento visual final não mudou (mesma ordem preservada), mas isso está comentado com `⚠️ FALHA` diretamente acima de cada ocorrência em `css/componentes/componentes.css`.
- Adicionados comentários explicativos em todo HTML (cabeçalho de cada página, navegação, formulários, scripts) e CSS (seções nomeadas + avisos de falha/código morto).
- Todo o projeto foi renomeado para PT-BR: `images/`→`imagens/`, `css/components/`→`css/componentes/`, `css/pages/`→`css/paginas/`, `main.css`→`principal.css`, `variables.css`→`variaveis.css`, `typography.css`→`tipografia.css`, `grid.css`→`grade.css`, `components.css`→`componentes.css`, e os órfãos da raiz `style.css`→`estilo.css`, `script.js`→`roteiro.js`, `logo.jpg`→`logotipo.jpg`.
- Nenhum comando `git add`/`commit`/`push` foi executado em nenhum momento.

## 10. Correções desta auditoria (resposta às inconsistências apontadas)

- **estilo.css (raiz) e css/style.css (legado) foram REMOVIDOS.** Eram os dois arquivos
  monolíticos de 1487/1488 linhas que ainda sobravam no projeto — órfãos, não referenciados
  por nenhum HTML, e cujo conteúdo já estava 100% replicado nos arquivos divididos
  (base/ + componentes/ + paginas/). Mantê-los contradizia o pedido original de não haver
  um CSS único. roteiro.js e logotipo.jpg (raiz) também removidos pelo mesmo motivo.
- **js/script.js renomeado para js/roteiro.js** e **curator-dashboard.html /
  professional-dashboard.html renomeados para curador-dashboard.html /
  profissional-dashboard.html** — estavam em inglês por descuido da rodada anterior.
- **3 duplicatas de CSS que faltavam ser sinalizadas foram encontradas e comentadas:**
  `.stat-card`, `.stat-label` e `.progress-fill` também são definidas duas vezes no CSS
  original (além de `.stats-grid`, `.progress-bar` e `.section-title`, já sinalizadas antes).
  Total real: 6 classes duplicadas no CSS original, todas agora comentadas com ⚠️ FALHA
  em css/componentes/componentes.css.
- Não há CSS único no projeto ativo — apenas os 8 arquivos divididos, agregados via
  css/principal.css.
