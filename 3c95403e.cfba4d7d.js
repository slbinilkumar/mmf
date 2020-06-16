(window.webpackJsonp=window.webpackJsonp||[]).push([[12],{148:function(e,n,t){"use strict";t.r(n),t.d(n,"frontMatter",(function(){return o})),t.d(n,"metadata",(function(){return s})),t.d(n,"rightToc",(function(){return l})),t.d(n,"default",(function(){return d}));var a=t(2),i=t(9),r=(t(0),t(165)),o={id:"concat_bert",title:"Tutorial: Adding a model - Concat BERT",sidebar_label:"Adding a model - Concat BERT"},s={id:"tutorials/concat_bert",title:"Tutorial: Adding a model - Concat BERT",description:"In this tutorial, we will go through the step-by-step process of creating a new model using MMF. In this case, we will create a fusion model and train it on the Hateful Memes dataset.",source:"@site/docs/tutorials/concat_bert.md",permalink:"/docs/tutorials/concat_bert",editUrl:"https://github.com/facebookresearch/mmf/edit/master/website/docs/tutorials/concat_bert.md",lastUpdatedBy:"Woojeong Jin",lastUpdatedAt:1592342103,sidebar_label:"Adding a model - Concat BERT",sidebar:"docs",previous:{title:"Adding a dataset",permalink:"/docs/tutorials/dataset"},next:{title:"Tutorial: Understanding Checkpointing for Pretraining and Finetuning",permalink:"/docs/tutorials/checkpointing"}},l=[{value:"Prerequisites",id:"prerequisites",children:[]},{value:"Using MMF to build the model",id:"using-mmf-to-build-the-model",children:[]},{value:"Model Config",id:"model-config",children:[]},{value:"Experiment Config",id:"experiment-config",children:[]},{value:"Training and Evaluation",id:"training-and-evaluation",children:[]}],c={rightToc:l};function d(e){var n=e.components,t=Object(i.a)(e,["components"]);return Object(r.b)("wrapper",Object(a.a)({},c,t,{components:n,mdxType:"MDXLayout"}),Object(r.b)("p",null,"In this tutorial, we will go through the step-by-step process of creating a new model using MMF. In this case, we will create a fusion model and train it on the ",Object(r.b)("a",Object(a.a)({parentName:"p"},{href:"https://github.com/facebookresearch/mmf/tree/master/projects/hateful_memes"}),"Hateful Memes dataset"),"."),Object(r.b)("p",null,"The fusion model that we will create concatenates embeddings from a text encoder and an image encoder and passes them through a two-layer classifier. MMF provides standard image and text encoders out of the box. For the image encoder, we will use ResNet152 image encoder and for the text encoder, we will use BERT-Base Encoder."),Object(r.b)("h2",{id:"prerequisites"},"Prerequisites"),Object(r.b)("p",null,"Follow the prerequisites for installation and dataset ",Object(r.b)("a",Object(a.a)({parentName:"p"},{href:"https://github.com/facebookresearch/mmf/tree/master/projects/hateful_memes#prerequisites"}),"here"),"."),Object(r.b)("h2",{id:"using-mmf-to-build-the-model"},"Using MMF to build the model"),Object(r.b)("p",null,"We will start building our model ",Object(r.b)("inlineCode",{parentName:"p"},"ConcatBERT")," using the various building blocks available in MMF. Helper builder methods like  ",Object(r.b)("inlineCode",{parentName:"p"},"build_image_encoder")," for building image encoders, ",Object(r.b)("inlineCode",{parentName:"p"},"build_text_encoder")," for building text encoders, ",Object(r.b)("inlineCode",{parentName:"p"},"build_classifier_layer")," for classifier layers etc take configurable params which are defined in the config we will create in the next section. Follow the code and read through the comments to understand how the model is implemented."),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-python"}),'\nimport torch\n\n# registry is need to register our new model so as to be MMF discoverable\nfrom mmf.common.registry import registry\n\n# All model using MMF need to inherit BaseModel\nfrom mmf.models.base_model import BaseModel\n\n# Builder methods for image encoder and classifier\nfrom mmf.utils.build import (\n    build_classifier_layer,\n    build_image_encoder,\n    build_text_encoder,\n)\n\n\n# Register the model for MMF, "concat_bert" key would be used to find the model\n@registry.register_model("concat_bert")\nclass ConcatBERT(BaseModel):\n    # All models in MMF get first argument as config which contains all\n    # of the information you stored in this model\'s config (hyperparameters)\n    def __init__(self, config):\n        # This is not needed in most cases as it just calling parent\'s init\n        # with same parameters. But to explain how config is initialized we\n        # have kept this\n        super().__init__(config)\n        self.build()\n\n    # This classmethod tells MMF where to look for default config of this model\n    @classmethod\n    def config_path(cls):\n        # Relative to user dir root\n        return "configs/models/concat_bert/defaults.yaml"\n\n    # Each method need to define a build method where the model\'s modules\n    # are actually build and assigned to the model\n    def build(self):\n        """\n        Config\'s image_encoder attribute will be used to build an MMF image\n        encoder. This config in yaml will look like:\n\n        # "type" parameter specifies the type of encoder we are using here.\n        # In this particular case, we are using resnet152\n        type: resnet152\n        # Parameters are passed to underlying encoder class by\n        # build_image_encoder\n        params:\n            # Specifies whether to use a pretrained version\n            pretrained: true\n            # Pooling type, use max to use AdaptiveMaxPool2D\n            pool_type: avg\n            # Number of output features from the encoder, -1 for original\n            # otherwise, supports between 1 to 9\n            num_output_features: 1\n        """\n        self.vision_module = build_image_encoder(self.config.image_encoder)\n\n        """\n        For text encoder, configuration would look like:\n        # Specifies the type of the langauge encoder, in this case mlp\n        type: transformer\n        # Parameter to the encoder are passed through build_text_encoder\n        params:\n            # BERT model type\n            bert_model_name: bert-base-uncased\n            hidden_size: 768\n            # Number of BERT layers\n            num_hidden_layers: 12\n            # Number of attention heads in the BERT layers\n            num_attention_heads: 12\n        """\n        self.language_module = build_text_encoder(self.config.text_encoder)\n\n        """\n        For classifer, configuration would look like:\n        # Specifies the type of the classifier, in this case mlp\n        type: mlp\n        # Parameter to the classifier passed through build_classifier_layer\n        params:\n            # Dimension of the tensor coming into the classifier\n            # Visual feature dim + Language feature dim : 2048 + 768\n            in_dim: 2816\n            # Dimension of the tensor going out of the classifier\n            out_dim: 2\n            # Number of MLP layers in the classifier\n            num_layers: 2\n        """\n        self.classifier = build_classifier_layer(self.config.classifier)\n\n    # Each model in MMF gets a dict called sample_list which contains\n    # all of the necessary information returned from the image\n    def forward(self, sample_list):\n        # Text input features will be in "input_ids" key\n        text = sample_list["input_ids"]\n        # Similarly, image input will be in "image" key\n        image = sample_list["image"]\n\n        # Get the text and image features from the encoders\n        text_features = self.language_module(text)[1]\n        image_features = self.vision_module(image)\n\n        # Flatten the embeddings before concatenation\n        image_features = torch.flatten(image_features, start_dim=1)\n        text_features = torch.flatten(text_features, start_dim=1)\n\n        # Concatenate the features returned from two modality encoders\n        combined = torch.cat([text_features, image_features], dim=1)\n\n        # Pass final tensor to classifier to get scores\n        logits = self.classifier(combined)\n\n        # For loss calculations (automatically done by MMF\n        # as per the loss defined in the config),\n        # we need to return a dict with "scores" key as logits\n        output = {"scores": logits}\n\n        # MMF will automatically calculate loss\n        return output\n\n')),Object(r.b)("p",null,"The model\u2019s forward method takes a ",Object(r.b)("inlineCode",{parentName:"p"},"SampleList")," and outputs a dict containing the logit scores predicted by the model. Different losses and metrics can be calculated on the scores output."),Object(r.b)("p",null,"We will define two configs needed for our experiments: (i) a model config for the model's default configurations, and (ii) an experiment config for our particular experiment. The model config provides the model\u2019s default hyperparameters and the experiment config defines and overrides the defaults needed for our particular experiment such as optimizer type, learning rate, maximum updates and batch size."),Object(r.b)("h2",{id:"model-config"},"Model Config"),Object(r.b)("p",null,"We will now create the model config file with the params we used while creating the model and store the config in ",Object(r.b)("inlineCode",{parentName:"p"},"configs/models/concat_bert/defaults.yaml"),"."),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-yaml"}),"\nmodel_config:\n  concat_bert:\n    # Type of bert model\n    bert_model_name: bert-base-uncased\n    direct_features_input: false\n    # Dimension of the embedding finally returned by the modal encoder\n    modal_hidden_size: 2048\n    # Dimension of the embedding finally returned by the text encoder\n    text_hidden_size: 768\n    # Used when classification head is activated\n    num_labels: 2\n    # Number of features extracted out per image\n    num_features: 1\n\n    image_encoder:\n      type: resnet152\n      params:\n        pretrained: true\n        pool_type: avg\n        num_output_features: 1\n\n    text_encoder:\n      type: transformer\n      params:\n        bert_model_name: bert-base-uncased\n        hidden_size: 768\n        num_hidden_layers: 12\n        num_attention_heads: 12\n        output_attentions: false\n        output_hidden_states: false\n\n    classifier:\n      type: mlp\n      params:\n        # 2048 + 768 in case of features\n        # Modal_Dim * Number of embeddings + Text Dim\n        in_dim: 2816\n        out_dim: 2\n        hidden_dim: 768\n        num_layers: 2\n\n")),Object(r.b)("h2",{id:"experiment-config"},"Experiment Config"),Object(r.b)("p",null,"In the next step, we will create the experiment config which will tell MMF which dataset, optimizer, scheduler, metrics for evalauation to use. We will save this config in ",Object(r.b)("inlineCode",{parentName:"p"},"configs/experiments/concat_bert/defaults.yaml"),":"),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-yaml"}),"\nincludes:\n- configs/datasets/hateful_memes/bert.yaml\n\nmodel_config:\n  trying:\n    classifier:\n      type: mlp\n      params:\n        num_layers: 2\n    losses:\n    - type: cross_entropy\n\nscheduler:\n  type: warmup_linear\n  params:\n    num_warmup_steps: 2000\n    num_training_steps: ${training.max_updates}\n\noptimizer:\n  type: adam_w\n  params:\n    lr: 5e-5\n    eps: 1e-8\n\nevaluation:\n  metrics:\n  - accuracy\n  - binary_f1\n  - roc_auc\n\ntraining:\n  batch_size: 64\n  lr_scheduler: true\n  max_updates: 22000\n  early_stop:\n    criteria: hateful_memes/roc_auc\n    minimize: false\n\n")),Object(r.b)("p",null,"We include the ",Object(r.b)("inlineCode",{parentName:"p"},"bert.yaml")," config in this as we want to use BERT tokenizer for preprocessing our language data. With both the configs ready we are ready to launch training and evaluation using our model on the Hateful Memes dataset. You can read more about the MMF\u2019s configuration system ",Object(r.b)("a",Object(a.a)({parentName:"p"},{href:"https://mmf.sh/docs/notes/configuration"}),"here"),"."),Object(r.b)("h2",{id:"training-and-evaluation"},"Training and Evaluation"),Object(r.b)("p",null,"Now we are ready to train and evaluate our model with the experiment config we created in previous step."),Object(r.b)("pre",null,Object(r.b)("code",Object(a.a)({parentName:"pre"},{className:"language-bash"}),'mmf_run config="configs/experiments/concat_bert/defaults.yaml" \\\n    model=concat_bert \\\n    dataset=hateful_memes \\\n    run_type=train_val\n')),Object(r.b)("p",null,"When training ends it will save a final model ",Object(r.b)("inlineCode",{parentName:"p"},"concat_bert_final.pth")," in the experiment folder under ",Object(r.b)("inlineCode",{parentName:"p"},"./save")," directory. More details about checkpoints can be found ",Object(r.b)("a",Object(a.a)({parentName:"p"},{href:"https://mmf.sh/docs/tutorials/checkpointing"}),"here"),". The command will also generate validation scores after the training gets over."))}d.isMDXComponent=!0},165:function(e,n,t){"use strict";t.d(n,"a",(function(){return u})),t.d(n,"b",(function(){return p}));var a=t(0),i=t.n(a);function r(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);n&&(a=a.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,a)}return t}function s(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){r(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,a,i=function(e,n){if(null==e)return{};var t,a,i={},r=Object.keys(e);for(a=0;a<r.length;a++)t=r[a],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);for(a=0;a<r.length;a++)t=r[a],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var c=i.a.createContext({}),d=function(e){var n=i.a.useContext(c),t=n;return e&&(t="function"==typeof e?e(n):s(s({},n),e)),t},u=function(e){var n=d(e.components);return i.a.createElement(c.Provider,{value:n},e.children)},m={inlineCode:"code",wrapper:function(e){var n=e.children;return i.a.createElement(i.a.Fragment,{},n)}},f=i.a.forwardRef((function(e,n){var t=e.components,a=e.mdxType,r=e.originalType,o=e.parentName,c=l(e,["components","mdxType","originalType","parentName"]),u=d(t),f=a,p=u["".concat(o,".").concat(f)]||u[f]||m[f]||r;return t?i.a.createElement(p,s(s({ref:n},c),{},{components:t})):i.a.createElement(p,s({ref:n},c))}));function p(e,n){var t=arguments,a=n&&n.mdxType;if("string"==typeof e||a){var r=t.length,o=new Array(r);o[0]=f;var s={};for(var l in n)hasOwnProperty.call(n,l)&&(s[l]=n[l]);s.originalType=e,s.mdxType="string"==typeof e?e:a,o[1]=s;for(var c=2;c<r;c++)o[c]=t[c];return i.a.createElement.apply(null,o)}return i.a.createElement.apply(null,t)}f.displayName="MDXCreateElement"}}]);