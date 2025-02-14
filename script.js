import EditorJs from '@editorjs/editorjs';
import header from '@editorjs/header';
import List from '@editorjs/list';
import Embed from '@editorjs/embed';

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
      class: header,
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
  }
});

let saveBtn = document.getElementById('save');

saveBtn.addEventListener('click', function() {
  editor.save().then((outputData) => {
    salvarData(outputData);
  }).catch((error) => {
    console.log(error);
  })
}) 

function salvarData(codigo) {
  const nomeArquivo = prompt("Digite o nome do template:");

  if (!nomeArquivo) {
      alert("Nome do template não pode ser vazio");
      return;
  }

  fetch("http://localhost/EditorJs/editor_php/salvar_script.php", {
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
      console.log("Resposta do servidor:", data);
  })
  .catch(error => {
      console.error("Erro ao enviar:", error);
  });
}

//importar

document.getElementById('import').addEventListener('click', function() {
  document.getElementById('template').style.display = 'flex';
  carregarTemplates();
});

document.getElementById('close').addEventListener('click', function() {
  document.getElementById('template').style.display = 'none';
});

function carregarTemplates() {
  fetch("http://localhost/EditorJs/editor_php/carregar_script.php", {
    method: "GET",
  })
  .then(response => response.json())
  .then(data => {
    const templateList = document.getElementById('templateList');
    templateList.innerHTML = '';

    
    data.forEach(template => {
      const templateItem = document.createElement('div');
      templateItem.classList.add('template-item');

      const templateContent = document.createElement('div');
      templateContent.innerHTML = `
        <strong>${template.nome_arquivo}</strong>
        <br>
        Última alteração: ${new Date(template.ultima_alter).toLocaleString()}
      `;

      const buttonContainer = document.createElement('div');
      buttonContainer.classList.add('button-container');

      const btn1 = document.createElement('button');
      btn1.textContent = 'Aplicar';
      btn1.addEventListener('click', function() {
        aplicarTemplate(template.codigo)
      });
      
      const btn2 = document.createElement('button');
      btn2.textContent = 'Deletar';
      btn2.addEventListener('click', function() {
        deletarTemplate(template.id)
      });

      buttonContainer.appendChild(btn1);
      buttonContainer.appendChild(btn2);

      templateContent.appendChild(buttonContainer);
      
      templateItem.appendChild(templateContent);

      templateList.appendChild(templateItem);
  });
})
.catch(error => console.error('Erro ao carregar templates:', error));
}

function aplicarTemplate(codigo) {
  editor.render(codigo)
    .then(() => {
      console.log("Template aplicado com sucesso.");
      document.getElementById('template').style.display = 'none';
    })
    .catch((error) => {
      console.error("Erro ao aplicar o template:", error);
    });
  }
  
  function deletarTemplate(id) {
    if (confirm('Tem certeza que deseja excluir este template?')) {
      fetch(`http://localhost/EditorJs/editor_php/deletar_script.php?ID=${id}`, {
        method: 'GET'
      })
      .then(response => response.json())
      .then(data => {
        console.log('Template deletado:', data);
        if (data.reset) {
          document.getElementById('template').style.display = 'none';
        }
        carregarTemplates();
        clearTemplate();
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
      if (currentBlockIndex !== -1) {
          editor.blocks.delete(currentBlockIndex);
      }
  }
});