import {ElementRef, Injectable} from '@angular/core';
import { Ace, edit } from 'ace-builds';
import * as ace from 'ace-builds';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-dracula';
@Injectable({
  providedIn: 'root'
})
export class JsonEditorService {
  /**
   * Editor Instance
   */
  private m_oEditor!: Ace.Editor;

  /**
   * The text to display by default in the editor
   */
  private m_sText: string = "";

  /**
   * Can the user edit this instance of the editor?
   */
  private m_bReadOnly: boolean = false;

  /**
   * The mode of the editor (e.g., JSON, javascript, etc.) by default JSON
   */
  private m_sMode: string = "json";

  /**
   * Prettify - formatting
   */
  private m_bPrettify: boolean = true;

  /**
   * Default formatting options
   */
  private m_oOptions = {
    showPrintMargin: false,
    highlightActiveLine: true,
    tabSize: 2,
    wrap: true,
    fontSize: 14,
    fontFamily: '\'Roboto Mono Regular\', monospace',
  }
  constructor() {

  }

  /**
   * Set the value of the Editor value
   * @param oEditorReference
   */
  setEditor(oEditorReference: ElementRef): void {
    this.m_oEditor = edit(oEditorReference.nativeElement);
  }

  initEditor(): void {
    this.m_oEditor.setOptions(this.m_oOptions);
    this.m_oEditor.setValue(this.m_sText, -1);
    this.m_oEditor.setReadOnly(this.m_bReadOnly);
    this.setEditorMode();
    this.m_oEditor.setTheme('ace/theme/dracula');
    this.m_oEditor.session.setUseWorker(false);
    this.m_oEditor.on('change', () => this.onEditorTextChange());
  }

  setEditorMode(): void {
    this.m_oEditor.getSession().setMode(`ace/mode/${this.m_sMode}`);
  }

  setText(sInputText: string): void {
    this.m_sText = sInputText;
    this.m_oEditor.setValue(sInputText, -1);
  }

  getPosition() {
    return this.m_oEditor.getCursorPosition();
  }

  getValue() {
    return this.m_oEditor.getValue();
  }

  onEditorTextChange(): void {
    this.m_sText = this.m_oEditor.getValue();
  }

  setReadOnly(bIsReadOnly: boolean) {
    this.m_bReadOnly = bIsReadOnly;
    this.m_oEditor.setReadOnly(this.m_bReadOnly);
  }

  insertText(sTextToInsert) {
    let oPosition = this.m_oEditor.getCursorPosition();
    this.m_oEditor.session.insert(oPosition, sTextToInsert);
    this.m_sText = this.m_oEditor.getValue();
  }
}
