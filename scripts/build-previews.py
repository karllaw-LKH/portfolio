"""Optional image optimisation. Original portfolio images and CMS uploads stay usable without it."""
from pathlib import Path
import json
from PIL import Image,ImageOps

root=Path(__file__).resolve().parents[1]
data=json.loads((root/'data/content.json').read_text(encoding='utf8'))
profile=data['profile']
wide_paths={profile.get(key,'') for key in ['heroBanner','portrait','footerBanner']}
paths={*wide_paths,*[w['image'] for w in data['works']]}
for work_id,index in [('vanishing-route',0),('archive-point',2)]:
    work=next((w for w in data['works'] if w['id']==work_id),None)
    if work:paths.add(work['gallery'][index] if len(work['gallery'])>index else work['image'])
folder=root/'assets/previews';folder.mkdir(exist_ok=True)
manifest={}
for path in sorted(paths):
    source=root/path
    if not path.startswith(('assets/portfolio/','uploads/')) or not source.is_file():continue
    with Image.open(source) as im:
        image=ImageOps.exif_transpose(im).convert('RGB')
        sizes=[640,1920] if path in wide_paths else [640,1280]
        sources=[]
        for width in sizes:
            if path not in wide_paths and path!=next(iter(data['works']),{}).get('image') and path in {w['image'] for w in data['works']}:
                output_width=min(width,image.width,int(image.height*4/3))
                preview=ImageOps.fit(image,(output_width,round(output_width*3/4)),method=Image.Resampling.LANCZOS)
            else:
                preview=image.copy();preview.thumbnail((width,10000))
            target=folder/(source.stem+'-'+str(width)+'.webp')
            preview.save(target,'WEBP',quality=82,method=6)
            sources.append({'src':target.relative_to(root).as_posix(),'width':preview.width})
        manifest[path]=sources
(folder/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf8')
print('Created responsive previews for',len(manifest),'images.')
