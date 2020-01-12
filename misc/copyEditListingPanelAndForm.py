import json
import shutil
import pathlib
import os

ORIGINAL_ITEMNAME = f'Basicinfo'
TARGET_ITEMNAME = f'Detailinfo'


ORIGINAL_PANEL = f'../src/components/EditListing{ORIGINAL_ITEMNAME}Panel/'
TARGET_PANEL = f'../src/components/EditListing{TARGET_ITEMNAME}Panel/'
ORIGINAL_PANELNAME = f'EditListing{ORIGINAL_ITEMNAME}Panel'
TARGET_PANELNAME = f'EditListing{TARGET_ITEMNAME}Panel'

ORIGINAL_FORM = f'../src/forms/EditListing{ORIGINAL_ITEMNAME}Form/'
TARGET_FORM = f'../src/forms/EditListing{TARGET_ITEMNAME}Form/'
ORIGINAL_FORMNAME = f'EditListing{ORIGINAL_ITEMNAME}Form'
TARGET_FORMNAME = f'EditListing{TARGET_ITEMNAME}Form'

print(ORIGINAL_ITEMNAME)
print(ORIGINAL_PANEL)
print(ORIGINAL_FORM)

print(TARGET_ITEMNAME)
print(TARGET_PANEL)
print(TARGET_FORM)

# -------------------------------- copy EditListingPanel and change class-names --------------------------------
p = pathlib.Path(os.path.dirname(ORIGINAL_PANEL))
files = p.glob('*')
for file in files:
    orig_f = str(file)
    if '__' in orig_f:
        continue

    tar_f = orig_f.replace(ORIGINAL_PANELNAME, TARGET_PANELNAME)
    print(tar_f)

    tar_dir = os.path.dirname(tar_f)
    if not os.path.exists(tar_dir):
        os.makedirs(tar_dir)

    shutil.copy(orig_f, tar_f)

    # change class name in files
    with open(tar_f, 'r') as f:
        content = f.read()

    with open(tar_f, 'w') as f:
        content = content.replace(ORIGINAL_PANELNAME, TARGET_PANELNAME)
        content = content.replace(ORIGINAL_FORMNAME, TARGET_FORMNAME)
        f.write(content)


# -------------------------------- copy EditListingForm and change class-names --------------------------------
p = pathlib.Path(os.path.dirname(ORIGINAL_FORM))
files = p.glob('*')
for file in files:
    orig_f = str(file)
    if '__' in orig_f:
        continue

    tar_f = orig_f.replace(ORIGINAL_FORMNAME, TARGET_FORMNAME)
    print(tar_f)

    tar_dir = os.path.dirname(tar_f)
    if not os.path.exists(tar_dir):
        os.makedirs(tar_dir)

    shutil.copy(orig_f, tar_f)

    # change class name in files
    with open(tar_f, 'r') as f:
        content = f.read()

    with open(tar_f, 'w') as f:
        content_ = content.replace(ORIGINAL_FORMNAME, TARGET_FORMNAME)
        f.write(content_)


# -------------------------------- add panel import to components/index.js --------------------------------
COMPONENTS_INDEXJS = '../src/components/index.js'
with open(COMPONENTS_INDEXJS, 'r') as f:
    lines = f.readlines()

alredy_exsits = [TARGET_PANELNAME in line for line in lines]
if not any(alredy_exsits):
    idx = [ORIGINAL_PANELNAME in line for line in lines].index(True)
    orig_line = lines[idx]
    tar_line = orig_line.replace(ORIGINAL_PANELNAME, TARGET_PANELNAME)
    lines.insert(idx + 1, tar_line)

    with open(COMPONENTS_INDEXJS, 'w') as f:
        f.write("".join(lines))

# -------------------------------- add form import to forms/index.js --------------------------------
FORMS_INDEXJS = '../src/forms/index.js'
with open(FORMS_INDEXJS, 'r') as f:
    lines = f.readlines()

alredy_exsits = [TARGET_FORMNAME in line for line in lines]
if not any(alredy_exsits):
    idx = [ORIGINAL_FORMNAME in line for line in lines].index(True)
    orig_line = lines[idx]
    tar_line = orig_line.replace(ORIGINAL_FORMNAME, TARGET_FORMNAME)
    lines.insert(idx + 1, tar_line)

    with open(FORMS_INDEXJS, 'w') as f:
        f.write("".join(lines))


# -------------------------------- add translation --------------------------------
TRANSLATION_FILE = '../src/translations/en.json'
with open(TRANSLATION_FILE, 'r', encoding='utf8') as f:
    trans = json.load(f)

#   add key for EditListingsPanel/Form
orig_keys = filter(
    lambda key: f'EditListing{ORIGINAL_ITEMNAME}' in key, list(trans.keys()))
orig_keys = list(orig_keys)
print(orig_keys)
for orig_key in orig_keys:
    tar_key = orig_key.replace(ORIGINAL_ITEMNAME, TARGET_ITEMNAME)
    print(tar_key)
    trans[tar_key] = trans[orig_key]

#   add key for tabLabel
orig_keys = filter(
    lambda key: f'tabLabel{ORIGINAL_ITEMNAME}' in key, list(trans.keys()))
orig_keys = list(orig_keys)
print(orig_keys)
for orig_key in orig_keys:
    tar_key = orig_key.replace(ORIGINAL_ITEMNAME, TARGET_ITEMNAME)
    print(tar_key)
    trans[tar_key] = trans[orig_key]


with open(TRANSLATION_FILE, 'w', encoding='utf8') as f:
    json.dump(trans, f, indent=2, ensure_ascii=False, sort_keys=True)


# ----- util func ---------
def addLineToTaggedFile(filepath: str, tag: str, lineToAdd: str, addBeforeTab=True):
    with open(filepath, 'r') as f:
        lines = f.readlines()

    for i, line in enumerate(lines):
        if lineToAdd.split("\n")[0] + '\n' == line:  # if already added, no change
            break

        if tag in line:
            if addBeforeTab:
                new_lines = lines[:i] + [lineToAdd] + lines[i:]
            else:
                new_lines = lines[:i+1] + [lineToAdd] + lines[i+1:]

            with open(filepath, 'w') as f:
                f.write("".join(new_lines))

            break
    else:
        raise Exception(
            f"Error: Not Found '{tag}' in '{filepath}'")


# -------------------------------- add import to EditListingWizardTab --------------------------------
WIZARD_TAB_FILEPATH = f"../src/components/EditListingWizard/EditListingWizardTab.js"
TAG = "[ADD_EDITLISTINGPANEL_HERE]"
LINE_TO_ADD = f"  {TARGET_PANELNAME},\n"

addLineToTaggedFile(WIZARD_TAB_FILEPATH, TAG, LINE_TO_ADD)

# -------------------------------- add const(identifier) to EditListingWizardTab --------------------------------
TAG = "[ADD_EDITLISTINGIDENTIFIER_HERE]"
LINE_TO_ADD = f"export const {TARGET_ITEMNAME.upper()} = '{TARGET_ITEMNAME.lower()}';\n"

addLineToTaggedFile(WIZARD_TAB_FILEPATH, TAG, LINE_TO_ADD)

# -------------------------------- add supported_tab to EditListingWizardTab --------------------------------
TAG = "[ADD_SUPPORTEDTAB_HERE]"
LINE_TO_ADD = f"  {TARGET_ITEMNAME.upper()},\n"

addLineToTaggedFile(WIZARD_TAB_FILEPATH, TAG, LINE_TO_ADD)

# -------------------------------- add tab_case to EditListingWizardTab --------------------------------
TAG = "[ADD_TABCASE_HERE]"
LINE_TO_ADD = f"""    case {TARGET_ITEMNAME.upper()}: {{
      return (
        <{TARGET_PANELNAME}
          {{...panelProps({TARGET_ITEMNAME.upper()})}}
          submitButtonText={{createNextButtonText(tab, marketplaceTabs, isNewListingFlow, isLastTab)}}
          onSubmit={{values => {{
            onCompleteEditListingWizardTab(tab, values);
          }}}}
        />
      );
    }}
"""

addLineToTaggedFile(WIZARD_TAB_FILEPATH, TAG, LINE_TO_ADD)

# -------------------------------- add const(identifier) to EditListingWizard --------------------------------
WIZARD_FILEPATH = f"../src/components/EditListingWizard/EditListingWizard.js"
TAG = "[ADD_EDITLISTINGIDENTIFIER_HERE]" # NOTE: コメントを分けて、重複しないようにする
LINE_TO_ADD = f"  {TARGET_ITEMNAME.upper()},  // id added\n"

addLineToTaggedFile(WIZARD_FILEPATH, TAG, LINE_TO_ADD)

# -------------------------------- add tab to EditListingWizard --------------------------------
WIZARD_FILEPATH = f"../src/components/EditListingWizard/EditListingWizard.js"
TAG = "[ADD_TABS_HERE]" # NOTE: コメントを分けて、重複しないようにする
LINE_TO_ADD = f"  {TARGET_ITEMNAME.upper()},   // tab added\n"

addLineToTaggedFile(WIZARD_FILEPATH, TAG, LINE_TO_ADD)

# -------------------------------- add tab_label to EditListingWizard --------------------------------
TAG = "[ADD_TABLABEL_HERE]"
LINE_TO_ADD = f"""  }} else if (tab === {TARGET_ITEMNAME.upper()}) {{
    key = 'EditListingWizard.tabLabel{TARGET_ITEMNAME.capitalize()}';
"""

addLineToTaggedFile(WIZARD_FILEPATH, TAG, LINE_TO_ADD)

# -------------------------------- add tab_completed to EditListingWizard --------------------------------
TAG = "[ADD_TABCOMPLETED_HERE]"
LINE_TO_ADD = f"""    case {TARGET_ITEMNAME.upper()}:
      return !!(publicData && publicData.{ORIGINAL_ITEMNAME.lower()}) // TODO: revise;
"""

addLineToTaggedFile(WIZARD_FILEPATH, TAG, LINE_TO_ADD)


print("")
print("remaining todos:")
print("  In src/components/EditListingWizard/EditListingWizard.js")
print("  - Add intl Id of tabLabel like below...")
print(f"      }} else if (tab === {TARGET_ITEMNAME.upper()}) {{")
print(
    f"        key = 'EditListingWizard.tabLabel{TARGET_ITEMNAME.capitalize()}';")
print(f"      }}")
print("  - Add tabCombplete below...")
print(f"          case {TARGET_ITEMNAME.upper()}:")
print(f"            return !!(publicData && publicData.activity); // TODO: 修正")
