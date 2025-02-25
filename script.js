import EditorJs from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import ImageTool from '@editorjs/image';
import Embed from '@editorjs/embed';
import Columns from '@calumk/editorjs-columns';

class Spacer {
  static get toolbox() {
    return {
      title: "Espaço",
      icon: "⬜",
    };
  }

  render() {
    const div = document.createElement("div");
    div.style.height = "30px";
    return div;
  }

  save() {
    return {};
  }
}

const editor = new EditorJs({
  holder: 'editorjs',

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
          byFile: "http://localhost/EditorJsV.2/EditorJs/editor_php/upload_image.php"
        },
        field: "image",
        types: "image/*",
        additionalRequestData: { debug: "true" },
        uploader: {
          uploadByFile(file) {
            const formData = new FormData();
            formData.append("image", file);
    
            return fetch("http://localhost/EditorJsV.2/EditorJs/editor_php/upload_image.php", {
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
                byFile: "http://localhost/EditorJsV.2/EditorJs/editor_php/upload_image.php"
              },
              field: "image",
              types: "image/*",
              additionalRequestData: { debug: "true" },
              uploader: {
                uploadByFile(file) {
                  const formData = new FormData();
                  formData.append("image", file);
          
                  return fetch("http://localhost/EditorJsV.2/EditorJs/editor_php/upload_image.php", {
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
        }
      }
    }

  },
});

let nome_arquivo_atual = "";
let newProjectBtn = document.getElementById('new-project');

newProjectBtn.addEventListener('click', function() {
  editor.save().then((outputData) => {
      if (outputData.blocks.length === 0) {
    clearTemplate();
    nome_arquivo_atual = "";
  } else {
    if(confirm("O projeto atual vai ser perdido deseja continuar?")){
      clearTemplate();
      nome_arquivo_atual = "";
    } else {
    if(confirm("Deseja salvar o projeto?")){
      if (nome_arquivo_atual)  {
        if(confirm("Deseja salvar como ´" + nome_arquivo_atual + "´?")){
          salvarData(outputData, nome_arquivo_atual);
          clearTemplate();
          nome_arquivo_atual = "";
        } else {
          if(confirm("Deseja salvar como novo?")){
            salvarData(outputData, "");
            clearTemplate();
            nome_arquivo_atual = "";
          }
        }
      } else {
        if(confirm("Deseja salvar o projeto?")){
          salvarData(outputData, "");
          clearTemplate();
          nome_arquivo_atual = "";
        }
      }
    }
    }
  }
  })
});

function salvarData(codigo, nome) {
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

  fetch("http://localhost/EditorJsV.2/EditorJs/editor_php/salvar.php", {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      
      body: JSON.stringify({ 
          codigo: codigo, 
          nome_arquivo: nomeArquivo
      }),
  })
  .then(response => response.text())
  .then(data => {
      carregarTemplatesSave();
      console.log("Resposta do servidor:", data);
  })
  .catch(error => {
      console.error("Erro ao enviar:", error);
  });
}
//importar

document.getElementById('import').addEventListener('click', function() {
  document.getElementById('template').style.display = 'flex';
  carregarTemplatesImport();
});

document.getElementById('close').addEventListener('click', function() {
  document.getElementById('template').style.display = 'none';
  const menu = document.getElementsByClassName('drop-down-content')[0];
});

function carregarTemplatesGeneric(options) {
  fetch("http://localhost/EditorJsV.2/EditorJs/editor_php/carregar.php", { method: "GET" })
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
        versaoDiv.innerHTML = `Última alteração: ${new Date(template.ultima_alter).toLocaleString()}`
        
        templateItem.appendChild(templateContent);
        templateItem.appendChild(versaoDiv);

        const btns = document.createElement("div");
        btns.classList.add("btnImport")

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
          btns.appendChild(btnDeletar)
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
    onAplicar: template => aplicarTemplate(template.codigo, template.nome_arquivo),
    onDeletar: template => deletarTemplate(template.id),
    renderExtra: (template, templateItem, versaoDiv) => {
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

      dotsIcon.addEventListener("click", async (e) => {
        e.stopPropagation();
        dotsIcon.classList.toggle("rotate");
        dropdownContent.classList.toggle("view-menu");
        if(dropdownContent.classList.contains("view-menu")) {
          const versoes = await viewVersion(template.id);
          if(versoes && versoes.length) {
            displayVersions(versoes, dropdownContent, template.id);
          }
        }
      });
    }
  });
}

document.getElementById('save').addEventListener('click', function() {
  document.getElementById('templateSelect').style.display = "flex";
  editor.save().then((outputData) => {
    carregarTemplatesSave(outputData);
  }).catch((error) => {
    console.log(error);
  })
})


let selectedTemplate = null;
let codigoSave = null;
function carregarTemplatesSave(codigo) {
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
}

document.getElementById('newSave').addEventListener("click", function() {
  editor.save().then((data) => {
    salvarData(data, "");
    document.getElementById("templateSelect").style.display = "none";
  })
});

document.getElementById("saveAction").addEventListener("click", function() {
  if(selectedTemplate) {
    console.log(codigoSave);
    salvarData(codigoSave, selectedTemplate.nome_arquivo);
  document.getElementById("templateSelect").style.display = "none";
} else {
  alert("Selecione um template.");
}
}); selectedTemplate = null;



document.getElementById('closeSelect').addEventListener('click', function() {
  document.getElementById("templateSelect").style.display = "none";
});

function viewVersion(id) {
  return fetch(`http://localhost/EditorJsV.2/EditorJs/editor_php/versions.php?id=${id}`, {
    method: "GET",
  }) 
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
        fetch(`http://localhost/EditorJsV.2/EditorJs/editor_php/deletar.php?ID=${id}&versao=${versao}`, {
          method: 'GET'
        })
        .then(data => {
          viewVersion(id)
            .then(novasVersoes => {
              displayVersions(novasVersoes, content, id);
            })
            .catch(error => console.error('Erro ao atualizar as versões:', error));
        })
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

function aplicarVersao(versao, id){
  fetch(`http://localhost/EditorJsV.2/EditorJs/editor_php/carregar.php?versao=${versao}&id=${id}`)
    .then(response => response.json())
    .then(data => {
      console.log(data);
        editor.render(data[0].codigo);
    })
    .catch(error => console.error("Erro ao carregar template:", error));
}

function aplicarTemplate(codigo, nome_arquivo) {
  editor.render(codigo);
  nome_arquivo_atual = nome_arquivo;
  document.getElementById('template').style.display = 'none';
}
  
  function deletarTemplate(id) {
    if (confirm('Tem certeza que deseja excluir este template?')) {
      fetch(`http://localhost/EditorJsV.2/EditorJs/editor_php/deletar.php?ID=${id}`, {
        method: 'GET'
      })
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
    .catch(error => { 
        console.error('Erro ao deletar o template:', error);
    });
}
}

function clearTemplate() {
  editor.render({ blocks: []});
}

// Delete

document.addEventListener("keydown", (event) => {
  if (event.key === "Delete") {
    const currentBlockIndex = editor.blocks.getCurrentBlockIndex();
    const block = (editor.blocks.getBlockByIndex(currentBlockIndex));

    if (currentBlockIndex !== -1) {

      if (block.name === 'image') {
        const imgElement = block.holder.querySelector('img');
        const imageUrl = imgElement ? imgElement.src : null;
        if (imageUrl) {
          deleteImages(imageUrl);
        }
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
  })
});

//view code

const btnView = document.getElementById('view');
const btnEdit = document.getElementById('edit');

btnView.addEventListener('click', function() {
  changeview(this);
})

btnEdit.addEventListener('click', function() {
  changeview(this);
})

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
    })
    
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

function display(jsoncode){
  var text = document.getElementById('jsonDisplay');
  text.textContent = JSON.stringify(jsoncode, null, 2);
}

function deleteImages(imageUrl) {
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

    fetch('http://localhost/EditorJsV.2/EditorJs/editor_php/delete_image.php', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageUrl })
    })
    .then(response => response.json())
    .then(data => console.log('Imagem deletada:', data))
    .catch(error => console.error('Erro ao deletar a imagem:', error));
  }).catch(error => console.error("Erro ao salvar os dados do editor:", error));
}