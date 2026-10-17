from gradio_client import Client, handle_file
import json
client=Client('https://tencent-hunyuan3d-2-1.hf.space',download_files='/Users/sayyid/Documents/github/the100hackathoner/outputs/buzo-21-review/generated-3d')
job=client.submit(image=handle_file('/Users/sayyid/Documents/github/the100hackathoner/public/landing/assets/projects/068-buzo-21-night-v2.png'),steps=30,guidance_scale=5,seed=68,octree_resolution=384,check_box_rembg=True,num_chunks=8000,randomize_seed=False,api_name='/generation_all')
print('Submitted textured model generation.',flush=True)
result=job.result()
with open('/Users/sayyid/Documents/github/the100hackathoner/outputs/buzo-21-review/generated-3d-result.json','w') as f:json.dump(result,f,default=str)
print(str(result)[:2000],flush=True)
