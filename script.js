import EditorJs from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image';
import Embed from '@editorjs/embed';
import Columns from '@calumk/editorjs-columns';
import CarouselTool from './Plugins/Carousel/Carousel.js';
import Paragraph from '@editorjs/paragraph';

const currentPath = window.location.href.toString().split(window.location.host)[1];

class Spacer {
  static get toolbox() {
    return {
      title: "Espaço",
      icon: "<span class='material-symbols-outlined'>crop_7_5</span>",
    };
  }

  constructor({ data }) {
    this.data = {
      height: data?.height !== undefined ? data.height : 80,
    };
    this.wrapper = null;
  }

  render() {
    this.wrapper = document.createElement("div");
    this.wrapper.style.height = `${this.data.height}px`;
    this.wrapper.style.backgroundColor = 'transparent';
    return this.wrapper;
  }

  renderSettings() {
    const wrapper = document.createElement('div');
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";

    const sizeButton = document.createElement('button');
    sizeButton.classList.add('inline-btn');

    const sizeIcon = document.createElement('span');
    sizeIcon.classList.add('material-symbols-outlined');
    sizeIcon.textContent = 'Straighten';
    sizeButton.appendChild(sizeIcon);

    const sizeText = document.createElement('span');
    sizeText.textContent = 'Tamanho';
    sizeButton.appendChild(sizeText);

    sizeButton.addEventListener('click', () => {
      this.showModal('Definir Tamanho', this.data.height, (value) => {
        if (value) {
          this.data.height = parseInt(value, 10);
          this.wrapper.style.height = `${this.data.height}px`;
        }
      });
    });

    wrapper.appendChild(sizeButton);
    return wrapper;
  }

  showModal(title, defaultValue, callback) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const modal = document.createElement('div');
    modal.className = 'modal';
    const heading = document.createElement('h2');
    heading.textContent = title;
    modal.appendChild(heading);
    const divInput = document.createElement('div');
    const input = document.createElement('input');
    input.type = 'text';
    input.value = defaultValue;
    divInput.appendChild(input);
    const submitButton = document.createElement('button');
    submitButton.textContent = 'OK';
    divInput.appendChild(submitButton);
    modal.appendChild(divInput);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    const submit = () => {
      const value = input.value;
      callback(value);
      document.body.removeChild(overlay);
    };

    submitButton.addEventListener('click', submit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        submit();
      }
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });
  }


  save() {
    return this.data.height;
  }
}

let globalId = null;

const editor = new EditorJs({
  holder: 'editorjs',
  defaultBlock: 'paragraph',

  tools: {
    header: {
      class: Header,
      inlineToolbar: [
        'link',
        'bold'
      ],
      toolbox: {
        title: 'Header'
      },
      config: {
        levels: [2, 3, 4],
        defaultLevel: 3
      },
    },

    paragraph: {
      class: Paragraph,
      inlineToolbar: true,
      toolbox: {
        title: 'Parágrafo'
      },
    },

    list: {
      class: List,
      inlineToolbar: [
        'link',
        'bold'
      ]
    },

    embed: {
      class: Embed,
      inlineToolbar: false,
      config: {
        services: {
          youtube: true,
          coub: true
        }
      },
    },

    columns: {
      class: Columns,
      config: {
        levels: [2, 3],
        EditorJsLibrary: EditorJs,
        tools: {
          header: {
            class: Header,
            inlineToolbar: [
              'link',
              'bold'
            ],
            config: {
            levels: [2, 3, 4],
            defaultLevel: 3
            },
          },

          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
            toolbox: {
              title: 'Parágrafo'
            },
          },

          list: {
            class: List,
            inlineToolbar: [
              'link',
              'bold'
            ]
          },

          embed: {
            class: Embed,
            inlineToolbar: false,
            config: {
              services: {
                youtube: true,
                coub: true
              }
            },
          },

          spacer: Spacer,

          image: {
            class: ImageTool,
            config: {
              endpoints: {
                byFile: `http://localhost/EditorJs/editor_php/upload_image.php`
              },
              field: "image",
              types: "image/*",
              additionalRequestData: { debug: "true" },
              uploader: {
                uploadByFile(file) {
                  const formData = new FormData();
                  formData.append("image", file);

                  return fetch(`http://localhost/EditorJs/editor_php/upload_image.php`, {
                    method: "POST",
                    body: formData
                  })
                  .then(response => response.json())
                  .then(result => {
                    return result;
                  })
                  .catch(error => {
                  });
                }
              }
            },
            additionalRequestData: {
              customId: 'imagem'
            }
          },

          Carousle: {
            class: CarouselTool,
            config: {
              deleteImages: deleteImages,
            }
          }
        }
      }
    },

    spacer:{
      class: Spacer,

    },

    image: {
      class: ImageTool,
      config: {
        endpoints: {
          byFile: `http://localhost/EditorJs/editor_php/upload_image.php`
        },
        field: "image",
        types: "image/*",
        additionalRequestData: { debug: "true" },
        uploader: {
          uploadByFile(file) {
            const formData = new FormData();
            formData.append("image", file);

            return fetch(`http://localhost/EditorJs/editor_php/upload_image.php`, {
              method: "POST",
              body: formData
            })
            .then(response => response.json())
            .then(result => {
              return result;
            })
            .catch(error => {
            });
          }
        }
      },
      additionalRequestData: {
        customId: 'imagem'
      }
    },

    Carousel: {
    class: CarouselTool,
    config: {
      deleteImages: deleteImages
    }
    }
  },
});

let nome_arquivo_atual = "";
let newProjectBtn = document.getElementById('new-project');

newProjectBtn.addEventListener('click', async function() {
  const outputData = await editor.save();
  if (outputData.blocks.length === 0) {
    clearTemplate();
    nome_arquivo_atual = "";
  } else {
    if (confirm("O projeto atual vai ser perdido, deseja continuar?")) {
      clearTemplate();
      nome_arquivo_atual = "";
      globalId = null;
    } else {
      if (confirm("Deseja salvar o projeto atual?")) {
        carregarTemplatesSave(outputData);
        await esperarFecharPopup();
        if (confirm("Deseja criar um novo projeto?")) {
          clearTemplate();
          nome_arquivo_atual = "";
          globalId = null;
        }
      }
    }
  }
});

function salvarData(codigo, nome, reabrirSelect = true) {
  let nomeArquivo;
  if (!nome) {
    nomeArquivo = prompt("Digite o nome do template:");
    if (nomeArquivo === null) return;
    nome_arquivo_atual = nomeArquivo;
    if (!nomeArquivo) {
      alert("Nome do template não pode ser vazio");
      return;
    }
  } else {
    nomeArquivo = nome;
    nome_arquivo_atual = nome;
  }
  fetch("http://localhost/EditorJs/editor_php/salvar.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo: codigo, nome_arquivo: nomeArquivo, id: globalId }),
  })
  .then(response => response.text())
  .then(data => {
    let jsonData = JSON.parse(data);
    if (jsonData.template_id) {
      globalId = jsonData.template_id;
      if (jsonData.codigo) {
        const updatedCode = JSON.parse(jsonData.codigo);
        display(updatedCode);
        editor.render(updatedCode);
      } else {
        display(codigo);
        editor.render(codigo);
      }
    }
    if (reabrirSelect) {
      carregarTemplatesSave();
    }
  })
  .catch(error => { console.error("Erro ao enviar:", error); });

  return;
}

document.getElementById('close').addEventListener('click', function() {
  document.getElementById('template').style.display = 'none';
  const menu = document.getElementsByClassName('drop-down-content')[0];
});

document.getElementById('import').addEventListener('click', function() {
  document.getElementById('template').style.display = 'flex';
  carregarTemplatesImport();
});

function carregarTemplatesGeneric(options) {
  fetch("http://localhost/EditorJs/editor_php/carregar.php", { method: "GET" })
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById(options.containerId);
      container.innerHTML = "";

      if (data.length === 0) {
        container.innerHTML = "<strong style='font-size: 20px;'>Nenhum template salvo</strong>";
        const modal = document.getElementsByClassName("modal-content")[0];
        if (modal) {
          modal.style.setProperty('min-height', '150px');
          document.getElementById('templateList').classList.add('emptyTemplateList');
        }
        return;
      } else {
        const modal = document.getElementsByClassName("modal-content")[0];
        if (modal) {
          modal.style.setProperty('min-height', '');
          document.getElementById('templateList').classList.remove('emptyTemplateList');
          document.getElementById('templateList').style.alignItems = '';
        }
      }

      data.forEach(template => {
        const templateItem = document.createElement("div");
        templateItem.classList.add("template-item");

        const templateContent = document.createElement("div");
        templateContent.innerHTML = `<strong>${template.nome_arquivo}</strong>`;

        const versaoDiv = document.createElement("div");
        versaoDiv.classList.add('versao');
        versaoDiv.innerHTML = `Última alteração: ${new Date(template.ultima_alter).toLocaleString()}`;

        templateItem.appendChild(templateContent);
        templateItem.appendChild(versaoDiv);

        const btns = document.createElement("div");
        btns.classList.add("btnImport");

        if(options.onAplicar) {
          const btnAplicar = document.createElement("button");
          btnAplicar.textContent = "Aplicar";
          btnAplicar.addEventListener("click", (e) => {
            e.stopPropagation();
            options.onAplicar(template);
          });
          btns.appendChild(btnAplicar);
        }

        if(options.onDeletar) {
          const btnDeletar = document.createElement("button");
          btnDeletar.textContent = "Deletar";
          btnDeletar.addEventListener("click", (e) => {
            e.stopPropagation();
            options.onDeletar(template);
          });
          btns.appendChild(btnDeletar);
          templateItem.appendChild(btns);
        }

        if(options.onSelecionar) {
          templateItem.addEventListener("click", () => options.onSelecionar(template, templateItem));
        }

        if(options.renderExtra && typeof options.renderExtra === "function") {
          options.renderExtra(template, templateItem, versaoDiv);
        }
        container.appendChild(templateItem);
      });
    })
    .catch(error => console.error("Erro ao carregar templates:", error));
}

function carregarTemplatesImport() {
  carregarTemplatesGeneric({
    containerId: "templateList",
    onAplicar: template => aplicarTemplate(template.codigo, template.nome_arquivo, template.id),
    onDeletar: template => deletarTemplate(template.id),
    renderExtra: (template, templateItem, versaoDiv) => {
      viewVersion(template.id).then(versoes => {
        if (versoes && versoes.length > 0) {
          const dotsIcon = document.createElement('span');
          dotsIcon.classList.add('material-symbols-outlined');
          dotsIcon.textContent = 'keyboard_arrow_up';
          dotsIcon.id = 'dropdownId';

          versaoDiv.appendChild(dotsIcon);

          const dropdown = document.createElement('div');
          dropdown.id = 'dropdownid';
          dropdown.classList.add('drop-down');

          const dropdownContent = document.createElement('div');
          dropdownContent.classList.add('drop-down-content');

          dropdown.appendChild(dropdownContent);
          versaoDiv.appendChild(dropdown);

          dotsIcon.addEventListener("click", (e) => {
            e.stopPropagation();
            dotsIcon.classList.toggle("rotate");
            dropdownContent.classList.toggle("view-menu");
            if (dropdownContent.classList.contains("view-menu")) {
                displayVersions(dropdownContent, template.id, dotsIcon, dropdown);
            }
          });
        }
      });
    }
  });
}

document.addEventListener("click", function(event) {
  const popup = document.getElementById("template");

  if (
    popup.style.display === "flex" && 
    !event.target.closest(".modal-content") &&
    !event.target.closest("#import")
  ) {
    popup.style.display = "none";
  }
});

document.getElementById('save').addEventListener('click', function() {
  editor.save().then((outputData) => {
    carregarTemplatesSave(outputData);
  }).catch((error) => {
    console.log(error);
  });
});

let selectedTemplate = null;
let codigoSave = null;

function carregarTemplatesSave(codigo) {
  fetch("http://localhost/EditorJs/editor_php/carregar.php", { method: "GET" })
    .then(response => response.json())
    .then(data => {
      if (data.length === 0) {
        salvarData(codigo, "", false);
        return;
      }

      carregarTemplatesGeneric({
        containerId: "templateSelectList",
        onSelecionar: (template, element) => {
          document.querySelectorAll("#templateSelectList .template-item").forEach(item => item.classList.remove("temp-selected"));
          element.classList.add("temp-selected");
          selectedTemplate = template;
      codigoSave = codigo;
    },
    renderExtra: (template, templateItem) => {
      if (template.nome_arquivo === nome_arquivo_atual){
        templateItem.classList.add("temp-selected");
        selectedTemplate = template;
        codigoSave = codigo;
      }
    }
  });
  document.getElementById('templateSelect').style.display = "flex";
  });
}

document.addEventListener("click", function(event) {
  const popup = document.getElementById("templateSelect");

  if (
    popup.style.display === "flex" && 
    !event.target.closest(".modal-content ") &&
    !event.target.closest("#save")
  ) {
    popup.style.display = "none";
  }
});

document.getElementById('newSave').addEventListener("click", function() {
  editor.save().then((data) => {
    salvarData(data, "");
  });
});

document.getElementById("saveAction").addEventListener("click", function() {
  if(selectedTemplate) {
    salvarData(codigoSave, selectedTemplate.nome_arquivo, false);
    document.getElementById("templateSelect").style.display = "none";
  } else {
    alert("Selecione um template.");
  }
});
selectedTemplate = null;

document.getElementById('closeSelect').addEventListener('click', function() {
  document.getElementById("templateSelect").style.display = "none";
});

function esperarFecharPopup() {
  return new Promise((resolve) => {
    const closeBtn = document.getElementById('closeSelect');
    function onClose() {
      document.getElementById('templateSelect').style.display = "none";
      closeBtn.removeEventListener('click', onClose);
      resolve();
    }
    closeBtn.addEventListener('click', onClose);
  });
}

function viewVersion(id) {
  return fetch(`http://localhost/EditorJs/editor_php/versions.php?id=${id}`, { method: "GET" })
    .then(response => response.json())
    .then(data => {
      if (data.erro) {
        console.error(data.erro);
        return [];
      } else {
        return data;
      }
    })
    .catch(error => {
      console.error('Erro ao obter as versões:', error);
      return [];
    });
}

function displayVersions(content, id, dotsIcon, dropdown) {
  disableObserver = true;
  content.innerHTML = "";
  viewVersion(id).then(versoes => {
    versoes.forEach(versao => {
      const button = document.createElement('button');
      const span = document.createElement('span');
      span.textContent = versao === 1 ? `Versão: ${versao}.0` : `Versão: ${versao}`;
      button.appendChild(span);
      const icon = document.createElement('i');
      icon.classList.add('material-symbols-outlined');
      icon.textContent = 'delete';
      button.appendChild(icon);

      icon.addEventListener('click', async function() {
        if (confirm('Tem certeza que deseja excluir esta versão?')) {
          const response = await fetch(`http://localhost/EditorJs/editor_php/deletar.php?id=${id}&versao=${versao}`, { method: 'GET' });
          const text = await response.text();
          let versionData = text ? JSON.parse(text) : {};

          let images = [];
          if (versionData && versionData.codigo) {
            const templateData = typeof versionData.codigo === 'string'
              ? JSON.parse(versionData.codigo)
              : versionData.codigo;
              
            if (templateData.blocks && Array.isArray(templateData.blocks)) {
              templateData.blocks.forEach(block => {
                if (block.type === "image" && block.data && block.data.file && block.data.file.url) {
                  console.log("Image URL:", block.data.file.url);
                  images.push(block.data.file.url);
                }
                
                if (block.type === "Carousel" && block.data && block.data.decodeImages) {
                  if (typeof block.data.decodeImages === 'string') {
                    if (block.data.decodeImages.includes(',')) {
                      const urls = block.data.decodeImages.split(',').map(url => url.trim());
                      urls.forEach(url => {
                        if (url) {
                          console.log("Carousel URL:", url);
                          images.push(url);
                        }
                      });
                    } else {
                      console.log("Carousel URL:", block.data.decodeImages.trim());
                      images.push(block.data.decodeImages.trim());
                    }
                  }
                  else if (Array.isArray(block.data.decodeImages)) {
                    block.data.decodeImages.forEach(url => {
                      if (url) {
                        console.log("Carousel URL:", url);
                        images.push(url);
                      }
                    });
                  }
                }
              });
            }
          }

          for (const imgUrl of images) {
            const used = await isImageUsed(imgUrl, id, true);
            if (!used) {
              deleteImages(imgUrl, id);
            }
          }

          const versoesRestantes = await viewVersion(id);

          if (versoesRestantes.length > 0) {
            displayVersions(content, id, dotsIcon, dropdown);
          } else {
            if (dropdown) {
              dropdown.remove();
            }
            if (dotsIcon) {  
              dotsIcon.remove();
            }
          }
        }
      });

      button.addEventListener('click', (e) => {
        if (e.target.closest('i')) return;
        aplicarVersao(versao, id);
        document.getElementById('template').style.display = 'none';
        const menu = document.getElementsByClassName('drop-down-content')[0];
        menu.classList.remove('view-menu');
      });

      content.appendChild(button);
    });
});
}

function aplicarVersao(versao, id) {
  disableObserver = true;
  fetch(`http://localhost/EditorJs/editor_php/carregar.php?versao=${versao}&id=${id}`)
    .then(response => response.json())
    .then(data => {
      editor.render(data[0].codigo);
      globalId = id;
      if (btnView.classList.contains('selected')) {
        display(codigo);
      }
    })
    .catch(error => console.error("Erro ao carregar template:", error));
}

function aplicarTemplate(codigo, nome_arquivo, id) {
  disableObserver = true;
  editor.render(codigo);
  globalId = id;
  nome_arquivo_atual = nome_arquivo;
  document.getElementById('template').style.display = 'none';
  if (btnView.classList.contains('selected')) {
    display(codigo);
  }
}

function deletarTemplate(id) {
  if (confirm('Tem certeza que deseja excluir este template?')) {
    fetch(`http://localhost/EditorJs/editor_php/deletar.php?id=${id}`, { method: 'GET' })
    .then(response => response.text())
    .then(text => {
      let data = text ? JSON.parse(text) : {};
      if (data.reset) {
        document.getElementById('template').style.display = 'none';
      }
      carregarTemplatesImport();
      if (nome_arquivo_atual === data.nome_arquivo) {
        clearTemplate();
        nome_arquivo_atual = "";
      }
    })
    .catch(error => { console.error('Erro ao deletar o template:', error); });
}
}

async function clearTemplate() {
  const currentData = await editor.save();
  let images = [];

  currentData.blocks.forEach(block => {
    if (block.type === "image" && block.data.file && block.data.file.url) {
      images.push(block.data.file.url);
    }
    if (block.type === "Carousel" && block.data.images && Array.isArray(block.data.images)) {
      block.data.images.forEach(url => {
        images.push(url);
      });
    }
  });

  if (!globalId) {
    for (const imageUrl of images) {
      deleteImages(imageUrl);
    }
  } else {
    for (const imageUrl of images) {
      const used = await isImageUsed(imageUrl, globalId, true);
      if (!used) {
        deleteImages(imageUrl, globalId);
      }

    editor.render({ blocks: [] });
    globalId = null;
    nome_arquivo_atual = "";
    }
  }

  if (btnView.classList.contains('selected')) {
  }
  
  await editor.render({ blocks: [] });

  const emptyData = await editor.save();
  display(emptyData);
  globalId = null;
  nome_arquivo_atual = "";
}

document.addEventListener('click', (event) => {
  const dropdowns = document.getElementsByClassName('drop-down-content');

  Array.from(dropdowns).forEach((dropdown) => {
    if (event.target.closest('button')) return;
    if (dropdown.classList.contains("view-menu")){
      if (!event.target.closest('.drop-down-content')) {
        const dotsButton = document.getElementById('dropdownId');
        if (dotsButton) {
          console.log(dotsButton);
          dotsButton.classList.toggle('rotate');
        }
        dropdown.classList.remove('view-menu');
      }
    }
  });
});

const btnView = document.getElementById('view');
const btnEdit = document.getElementById('edit');

btnView.addEventListener('click', function() {
  changeview(this);
});

btnEdit.addEventListener('click', function() {
  changeview(this);
});

function changeview(clickedbtn) {
  const pag = document.getElementById('pag');
  const jsonView = document.getElementById('jsonview');

  if (clickedbtn === btnView) {
    btnEdit.classList.remove('selected');
    btnView.classList.add('selected');

    editor.save().then((outputData) => {
      display(outputData);
    }).catch((error) => {
      console.log(error);
    });

    jsonView.style.zIndex = 2;
    pag.style.zIndex = 1;
  } else if (clickedbtn === btnEdit) {
    btnView.classList.remove('selected');
    btnEdit.classList.add('selected');

    var text = document.getElementById('jsonDisplay');
    text.content = null;

    pag.style.zIndex = 2;
    jsonView.style.zIndex = 1;
  }
}

function display(jsoncode) {
  var text = document.getElementById('jsonDisplay');
  text.textContent = JSON.stringify(jsoncode, null, 2);
}

async function isImageUsed(imageUrl, id = globalId, checkId = false) {
  disableObserver = true;
  try{
    const decodeImageUrl = decodeURIComponent(imageUrl);  
    const currentData = await editor.save();

    if(currentData.blocks.some(block => block.type === "image" && block.data.file.url === decodeImageUrl)){
      return true;
    }

    if (currentData.blocks.some(block => 
      block.type === "Carousel" && block.data && block.data.decodeImages && 
      ((typeof block.data.decodeImages === 'string' && block.data.decodeImages.split(',').map(url => url.trim()).includes(decodeImageUrl)) ||
      (Array.isArray(block.data.decodeImages) && block.data.decodeImages.includes(decodeImageUrl))))) {
      return true;
    }

    if (checkId) {
      console.log(id);
      const responseMain = await fetch(`http://localhost/EditorJs/editor_php/carregar.php?id=${id}`, { method: "GET" });
      const mainData = await responseMain.json();
      console.log("checkId data: ", mainData);
      for (const item of mainData) {
          let templateData = item.codigo;
          if (templateData.blocks.some(block => block.type === "image" && block.data.file.url === decodeImageUrl)) {
            return true;
          }

          if (templateData.blocks.some(block => 
            block.type === "Carousel" && block.data && block.data.decodeImages && 
            ((typeof block.data.decodeImages === 'string' && block.data.decodeImages.split(',').map(url => url.trim()).includes(decodeImageUrl)) ||
            (Array.isArray(block.data.decodeImages) && block.data.decodeImages.includes(decodeImageUrl))))) {
            return true;
          }
        }
    }

    if (id) {
      const versions = await viewVersion(id);
      for (const version of versions) {
        console.log("versao: ", version);
        const response = await fetch(`http://localhost/EditorJs/editor_php/carregar.php?versao=${version}&id=${id}`, { method: "GET" });
        const versionData = await response.json();
        console.log(version , ": " , versionData);
        
        if(versionData.length > 0){

          for (let i = 0; i < versionData.length; i++) {
            let templateData = versionData[i].codigo;

            for (let j = 0; j < templateData.blocks.length; j++) {
              const block = templateData.blocks[j];

              if (block.type === "image" && block.data.file.url === decodeImageUrl) {
                return true;
              }

              if (block.type === "Carousel" && block.data && block.data.decodeImages) {
                if (typeof block.data.decodeImages === 'string' && block.data.decodeImages.split(',').map(url => url.trim()).includes(decodeImageUrl)) {
                  return true;
                } else if (Array.isArray(block.data.decodeImages) && block.data.decodeImages.includes(decodeImageUrl)) {
                  return true;
                }
              }

            }   
          }
        }
      }
    }

  } catch (error) {
    console.error("Erro ao verificar imagem", error);
  }
  return false;
}

export async function deleteImages(imageUrl, id = globalId) {
  console.log(id);
    fetch(`http://localhost/EditorJs/editor_php/delete_image.php`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl, id })
    })
}

/* DELETE */

document.addEventListener("keydown", (event) => {
  if (event.key === "Delete") {
    const currentBlockIndex = editor.blocks.getCurrentBlockIndex();
    const block = editor.blocks.getBlockByIndex(currentBlockIndex);
      editor.blocks.delete(currentBlockIndex);
    }
});

let disableObserver = false;

const observer = new MutationObserver((mutationsList) => {
  if (disableObserver) { disableObserver = false; return; }
  mutationsList.forEach((mutation) => {
    mutation.removedNodes.forEach((removedNode) => {
      if (removedNode.nodeType === Node.ELEMENT_NODE && removedNode.classList) {
        
        if (removedNode.classList.contains('ce-block')) {

          const imgElement = removedNode.querySelector('.image-tool__image-picture');
          if (imgElement && imgElement.src) {
            const used = isImageUsed(imgElement.src);
            if (!globalId || !used) {
              deleteImages(imgElement.src);
            }
          } else if (removedNode.querySelector('.carousel')) {
            const imageElements = removedNode.querySelectorAll('img');
            imageElements.forEach((img) => {
              if (img.src) {
                const used = isImageUsed(img.src);
                if (!globalId || !used) {
                  deleteImages(img.src);
                }
              }
            });
          }
        }
      }
    });
  });
});

const editorContainer = document.getElementById('editorjs');
observer.observe(editorContainer, { childList: true, subtree: true });