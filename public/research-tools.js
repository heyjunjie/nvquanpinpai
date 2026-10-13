const button=document.getElementById('copy-citation'),text=document.getElementById('citation-copy'),status=document.getElementById('citation-copy-status');
button?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(text.value);status.textContent='已复制，包含原档案链接。'}catch{text.focus();text.select();status.textContent='文案已选中，请使用系统复制。'}});
