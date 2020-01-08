import json
import shutil
import pathlib
import os

ORIGINAL_ITEMNAME = f'Activity'
TARGET_ITEMNAME = f'Basicinfo'


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

# change filepaths
p = pathlib.Path(os.path.dirname(ORIGINAL_PANEL))
files = p.glob('*')
files = list(files)
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


p = pathlib.Path(os.path.dirname(ORIGINAL_FORM))
files = p.glob('*')
files = list(files)
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


# add components import to index.js
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

# add components import to index.js
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


# add translation
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


print("")
print("remaining todos:")
print("  In src/components/EditListingWizard/EditListingWizardTab.js")
print("  - Add import panel from components like below...")
print(f"      EditListing{TARGET_ITEMNAME}Panel,")
print("  - Add const identifier like below...")
print(f"      export const {TARGET_ITEMNAME.upper()} = '{TARGET_ITEMNAME.lower()}';")
print("  - Add const SUPPORTED_TABS like below...")
print(f"      {TARGET_ITEMNAME.upper()},")
print("  - Add case like below...")
print(f"      case {TARGET_ITEMNAME.upper()}: ")
print("  In src/components/EditListingWizard/EditListingWizard.js")
print("  - Add import identifier from ./EditListingWizardTab like below...")
print(f"      {TARGET_ITEMNAME.upper()}, ")
print("  - Add intl Id of tabLabel like below...")
print(f"      }} else if (tab === {TARGET_ITEMNAME.upper()}) {{")
print(f"        key = 'EditListingWizard.tabLabel{TARGET_ITEMNAME.capitalize()}';")
print(f"      }}")
print("  - Add tabCombplete below...")
print(f"          case {TARGET_ITEMNAME.upper()}:")
print(f"            return !!(publicData && publicData.activity); // TODO: 修正")



