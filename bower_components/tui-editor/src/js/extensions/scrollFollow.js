/**
 * @fileoverview Implements Scroll Follow Extension
 * @author Sungho Kim(sungho-kim@nhnent.com) FE Development Team/NHN Ent.
 */


import extManager from '../extManager';
import ScrollSync from './scrollFollow.scrollSync';
import SectionManager from './scrollFollow.sectionManager';
import Button from '../ui/button';

extManager.defineExtension('scrollFollow', editor => {
    const className = 'tui-scrollfollow';
    const TOOL_TIP = {
        active: '자동 스크롤 끄기',
        inActive: '자동 스크롤 켜기'
    };

    if (editor.isViewOnly()) {
        return;
    }

    const cm = editor.getCodeMirror();
    const sectionManager = new SectionManager(cm, editor.preview);
    const scrollSync = new ScrollSync(sectionManager, cm, editor.preview.$el);

    let isScrollable = false;
    let isActive = true;
    let button;

    //UI
    if (editor.getUI().name === 'default') {
        //init button
        button = new Button({
            className,
            command: 'scrollFollowToggle',
            tooltip: TOOL_TIP.active,
            $el: $(`<button class="active ${className} tui-toolbar-icons" type="button"></button>`)
        });

        editor.getUI().toolbar.addButton(button);

        if (editor.currentMode === 'wysiwyg') {
            button.$el.hide();
        }

        //hide scroll follow button in wysiwyg
        editor.on('changeModeToWysiwyg', () => {
            button.$el.hide();
        });

        editor.on('changeModeToMarkdown', () => {
            button.$el.show();
        });

        //Commands
        editor.addCommand('markdown', {
            name: 'scrollFollowToggle',
            exec() {
                isActive = !isActive;

                if (isActive) {
                    button.$el.addClass('active');
                    button.tooltip = TOOL_TIP.active;
                } else {
                    button.$el.removeClass('active');
                    button.tooltip = TOOL_TIP.inActive;
                }
            }
        });
    }

    //Events
    cm.on('change', () => {
        isScrollable = false;
        sectionManager.makeSectionList();
    });

    editor.on('previewRenderAfter', () => {
        sectionManager.sectionMatch();
        scrollSync.syncToPreview();
        isScrollable = true;
    });

    cm.on('scroll', () => {
        if (!isActive) {
            return;
        }

        if (isScrollable && editor.preview.isVisible()) {
            scrollSync.syncToPreview();
        } else {
            scrollSync.saveScrollInfo();
        }
    });
});