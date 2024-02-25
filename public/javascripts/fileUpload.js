FilePond.registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginImageResize,
    FilePondPluginFileEncode,
  )
  FilePond.setOptions({
    stylePanelAspectRatio: 150 / 100,
    imageResizeTargetWidth: 100,
    imageResizeTargetHeight: 150
  })
  
  FilePond.parse(document.body);  //filePond je biblioteka koja olakšava upload datoteka... parsira cili dokument i traži elemente koji imaju 
  //filepond funkcionalnosti npr. <input type="file" name="cover" class="filepond"> jer ima class="filepond"