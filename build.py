from pathlib import Path
import re,json,zipfile,base64
p=Path(__file__).resolve().parent;base=(p/'base-v02.html').read_text();css=(p/'addon.css').read_text();js=(p/'addon.js').read_text();cat=(p/'catalog.json').read_text()
s=base.replace('</style>', '\n'+css+'\n</style>',1).replace('Jobboard V0.2','Jobboard V0.3',1).replace('SIMULATION LOCALE · V0.2','SNAPSHOT GITHUB · V0.3',1)
s=s.replace("['inspect','08','X-Ray · Dissection']];","['inspect','08','X-Ray · Dissection'],['sourceLab','09','Source & Atomic Lab']];",1)
s=s.replace("'Explore les atomes, les fonctions et le dashboard fidèle à la capture.'];","'Explore les atomes, les fonctions et le dashboard fidèle à la capture.','Étudie le vrai code, son AST, et prédis le trajet d’une interaction.'];",1)
s=s.replace("let page='overview';","let page='sourceLab';",1).replace("done.length+'/8'","done.length+'/9'").replace('done.length/8*100','done.length/9*100')
s=s.replace('rebuild,inspect};function render()','rebuild,inspect,sourceLab};function render()',1)
s=s.replace('data-page="inspect">Nouveau : dissection X-Ray →','data-page="sourceLab">Nouveau : Source & Atomic Lab →',1).replace('8 ATELIERS · 6 CANDIDATURES','9 ATELIERS · 6 CANDIDATURES',1).replace('PARCOURS / 01–08','PARCOURS / 01–09',1)
needle="window.addEventListener('hashchange',()=>{let id=location.hash.slice(1);"
assert needle in s
# JSON escaping to avoid terminating a script tag.
s=s.replace(needle,'\nconst SAL3_CATALOG='+cat.replace('</','<\\/')+';\n'+js+'\n'+needle,1)
assert "sourceLab};function render()" in s and "['sourceLab','09'" in s
(p/'index.html').write_text(s)
vid=p/'jobboard_moteur_logiciel.mp4'
standalone=s.replace('src="jobboard_moteur_logiciel.mp4"','src="data:video/mp4;base64,'+base64.b64encode(vid.read_bytes()).decode()+'"')
assert len(standalone)>len(s)
(p/'Software-Anatomy-Lab-V0.3.html').write_text(standalone)
