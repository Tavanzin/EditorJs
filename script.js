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
        title: 'Header',
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
                byFile: "http://localhost/EditorJs/editor_php/upload_image.php"
              },
              field: "image",
              types: "image/*",
              additionalRequestData: { debug: "true" },
              uploader: {
                uploadByFile(file) {
                  const formData = new FormData();
                  formData.append("image", file);

                  return fetch("http://localhost/EditorJs/editor_php/upload_image.php", {
                    method: "POST",
                    body: formData
                  })
                  .then(response => response.json())
                  .then(result => {
                    console.log("Resposta do servidor:", result);
                    return result;
                  })
                  .catch(error => {
                    console.error("Erro no upload:", error);
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
          byFile: "http://localhost/EditorJs/editor_php/upload_image.php"
        },
        field: "image",
        types: "image/*",
        additionalRequestData: { debug: "true" },
        uploader: {
          uploadByFile(file) {
            const formData = new FormData();
            formData.append("image", file);

            return fetch("http://localhost/EditorJs/editor_php/upload_image.php", {
              method: "POST",
              body: formData
            })
            .then(response => response.json())
            .then(result => {
              console.log("Resposta do servidor:", result);
              return result;
            })
            .catch(error => {
              console.error("Erro no upload:", error);
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
let globalId = null;
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
      console.log("id: ", globalId);
    }
    if (reabrirSelect) {
      carregarTemplatesSave();
    }
  })
  .catch(error => { console.error("Erro ao enviar:", error); });
  return;
}

document.getElementById('import').addEventListener('click', function() {
  console.log(currentPath);
  document.getElementById('template').style.display = 'flex';
  carregarTemplatesImport();
});

document.getElementById('close').addEventListener('click', function() {
  document.getElementById('template').style.display = 'none';
  const menu = document.getElementsByClassName('drop-down-content')[0];
});

function carregarTemplatesGeneric(options) {
  fetch("http://localhost/EditorJs/editor_php/carregar.php", { method: "GET" })
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById(options.containerId);
      container.innerHTML = "";

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
      viewVersion(template.id)
      .then(versoes => {
        if (versoes && versoes.length > 0) {
          const dotsIcon = document.createElement('span');
          dotsIcon.classList.add('material-symbols-outlined');
          dotsIcon.textContent = 'keyboard_arrow_up';

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
              displayVersions(versoes, dropdownContent, template.id);
            }
          });
        }
      });
    }
  });
}

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

function displayVersions(versoes, content, id) {
  content.innerHTML = "";
  versoes.forEach(versao => {
    const button = document.createElement('button');
    const span = document.createElement('span');
    if (versao === 1) {
      span.textContent = `Versão: ${versao}.0`;
    } else {
      span.textContent = `Versão: ${versao}`;
    }
    button.appendChild(span);
    const icon = document.createElement('i');
    icon.classList.add('material-symbols-outlined');
    icon.textContent = 'delete';
    button.appendChild(icon);
    icon.addEventListener('click', function() {
      if (confirm('Tem certeza que deseja excluir esta versão?')) {
        fetch(`http://localhost/EditorJs/editor_php/deletar.php?ID=${id}&versao=${versao}`, { method: 'GET' })
        .then(data => {
          viewVersion(id)
            .then(novasVersoes => {
              displayVersions(novasVersoes, content, id);
            })
            .catch(error => console.error('Erro ao atualizar as versões:', error));
        });
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
}

function aplicarVersao(versao, id) {
  fetch(`http://localhost/EditorJs/editor_php/carregar.php?versao=${versao}&id=${id}`)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      editor.render(data[0].codigo);
      globalId = id;
    })
    .catch(error => console.error("Erro ao carregar template:", error));
}

function aplicarTemplate(codigo, nome_arquivo, id) {
  editor.render(codigo);
  globalId = id;
  nome_arquivo_atual = nome_arquivo;
  document.getElementById('template').style.display = 'none';
}

function deletarTemplate(id) {
  if (confirm('Tem certeza que deseja excluir este template?')) {
    fetch(`http://localhost/EditorJs/editor_php/deletar.php?ID=${id}`, { method: 'GET' })
    .then(response => response.json())
    .then(data => {
      console.log('Template deletado:', data);
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

function clearTemplate() {
  editor.render({ blocks: [] });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Delete") {
    const currentBlockIndex = editor.blocks.getCurrentBlockIndex();
    const block = editor.blocks.getBlockByIndex(currentBlockIndex);

    if (currentBlockIndex !== -1) {
      if (block.name === 'image') {
        const imgElement = block.holder.querySelector('img');
        const imageUrl = imgElement ? imgElement.src : null;
        if (imageUrl) {
          deleteImages(imageUrl);
        }
      } else if (block.name === 'Carousel') {
        block.save().then((carouselData) => {
          for (let i = 0; i < carouselData.data.images.length; i++) {
            const imageUrl = carouselData.data.images;
            deleteImages(imageUrl[i]);
          }
        });
      }
      editor.blocks.delete(currentBlockIndex);
    }
  }
});

document.addEventListener('click', (event) => {
  const dropdowns = document.getElementsByClassName('drop-down-content');

  Array.from(dropdowns).forEach((dropdown) => {
    if (event.target.closest('button')) return;
    if (dropdown.classList.contains("view-menu")){
      if (!event.target.closest('.drop-down-content')) {
        const dotsButton = document.getElementById('dots');
        dotsButton.classList.toggle('rotate');
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

export function deleteImages(imageUrl) {
  editor.save().then(data => {
    const imageUrlCont = decodeURIComponent(imageUrl);
    const blocks = data.blocks;
    const blocksWithSameUrl = blocks.filter(block => {
      if (block.type === 'image') {
        return block.data.file.url === imageUrlCont;
      }
      return false;
    });
    if (blocksWithSameUrl.length > 1) {
      return;
    }
    if (!globalId) {
      fetch(`http://localhost/EditorJs/editor_php/delete_image.php`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl })
    })
    .then(response => response.json())
    .then(data => console.log('Imagem deletada:', data))
    .catch(error => console.error('Erro ao deletar a imagem:', error));
    } else {
      fetch(`http://localhost/EditorJs/editor_php/delete_image.php`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl,
      globalId
       })
    })
    .then(response => response.json())
    .then(data => console.log('Imagem deletada:', data))
    .catch(error => console.error('Erro ao deletar a imagem:', error));
    }
  }).catch(error => console.error("Erro ao salvar os dados do editor:", error));
}